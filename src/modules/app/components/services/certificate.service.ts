import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

/**
 * Service for handling mTLS certificate information.
 * This service fetches certificate information from the /me endpoint
 * which is exposed by the nginx configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private certificateDN: string | null = null;
  private readonly SERVICE_NAME = 'CertificateService';


  constructor(
    private http: HttpClient,
    private logger: LoggingService
  ) {
    this.logger.info(this.SERVICE_NAME, 'Certificate service initialized');
  }

  /**
   * Fetches the certificate information from the /me endpoint.
   * The endpoint returns the client's Distinguished Name (DN) in the X-Client-CN header.
   *
   * @param forceRefresh If true, forces a fresh certificate request even if a certificate is already cached
   * @returns An Observable that emits the certificate DN or null if no certificate is present
   */
  public fetchCertificateInfo(forceRefresh: boolean = false): Observable<string | null> {
    const startTime = Date.now();

    // If we already have a certificate and aren't forcing a refresh, return it immediately
    if (this.certificateDN && !forceRefresh) {
      this.logger.info(this.SERVICE_NAME, 'Using cached certificate DN (set forceRefresh=true to refresh)',
        { certificateDN: this.certificateDN });
      return of(this.certificateDN);
    }

    this.logger.info(this.SERVICE_NAME, 'Fetching certificate information from /me endpoint', { forceRefresh });

    return this.http.get('/me', {
      observe: 'response',
      responseType: 'text',
      headers: {
        // Add a cache buster to prevent any caching issues
        'X-Cache-Buster': Date.now().toString()
      }
    }).pipe(
      // Map the response to extract certificate information
      map(response => {
        const elapsedTime = Date.now() - startTime;
        this.logger.debug(this.SERVICE_NAME, `Received response from /me endpoint in ${elapsedTime}ms`, {
          status: response.status,
          statusText: response.statusText,
          headers: this.getHeadersAsObject(response)
        });

        const clientCN = response.headers.get('X-Client-CN');
        // Cache and return DN (no retries)
        this.certificateDN = clientCN;
        if (clientCN) {
          this.logger.info(this.SERVICE_NAME, 'Certificate DN found in response', { certificateDN: clientCN, elapsedTime });
        } else {
          this.logger.warn(this.SERVICE_NAME, 'No Certificate DN found in response');
        }
        return clientCN;
      }),


      // Handle errors
      catchError(error => {
        const elapsedTime = Date.now() - startTime;

        this.logger.error(
          this.SERVICE_NAME,
          `Error fetching certificate info (after ${elapsedTime}ms)`,
          error,
          { url: '/me' }
        );
        return of(null);
      }),

    );
  }

  /**
   * Helper method to convert HttpHeaders to a plain object for logging
   */
  private getHeadersAsObject(response: HttpResponse<any>): Record<string, string> {
    const headersObj: Record<string, string> = {};
    response.headers.keys().forEach(key => {
      headersObj[key] = response.headers.get(key) || '';
    });
    return headersObj;
  }

  /**
   * Gets the cached certificate DN.
   *
   * @returns The certificate DN or null if not available
   */
  public getCertificateDN(): string | null {
    this.logger.debug(this.SERVICE_NAME, 'Getting cached certificate DN', {
      hasCertificate: !!this.certificateDN
    });
    return this.certificateDN;
  }

  /**
   * Checks if a valid certificate is present.
   *
   * @returns True if a certificate is present, false otherwise
   */
  public hasCertificate(): boolean {
    const hasCert = !!this.certificateDN;
    this.logger.debug(this.SERVICE_NAME, `Certificate presence check: ${hasCert}`, {
      certificateDN: this.certificateDN
    });
    return hasCert;
  }

  /**
   * Extracts the organization name from the certificate DN.
   * The DN format is typically: CN=name, O=organization, C=country
   *
   * @returns The organization name or null if not available
   */
  public getOrganizationFromCertificate(): string | null {
    this.logger.debug(this.SERVICE_NAME, 'Extracting organization from certificate');

    if (!this.certificateDN) {
      this.logger.warn(this.SERVICE_NAME, 'Cannot extract organization: No certificate DN available');
      return null;
    }

    // Extract the organization (O=) from the DN
    this.logger.debug(this.SERVICE_NAME, 'Attempting to match organization pattern in DN', {
      dn: this.certificateDN
    });

    const match = this.certificateDN.match(/O=([^,]+)/i);
    const organization = match ? match[1].trim() : null;

    if (organization) {
      this.logger.info(this.SERVICE_NAME, 'Organization extracted from certificate', {
        organization
      });
    } else {
      this.logger.warn(this.SERVICE_NAME, 'No organization found in certificate DN', {
        dn: this.certificateDN
      });
    }

    return organization;
  }

  /**
   * Forces a refresh of the certificate information.
   * This is useful when the user changes their certificate selection mid-session.
   *
   * @returns An Observable that emits the refreshed certificate DN or null if no certificate is present
   */
  public refreshCertificate(): Observable<string | null> {
    this.logger.info(this.SERVICE_NAME, 'Manually refreshing certificate information');

    // Clear the cached certificate
    this.certificateDN = null;

    // Force a refresh with retries
    return this.fetchCertificateInfo(true);
  }

}
