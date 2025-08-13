import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, timer, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, retryWhen, delayWhen, scan, concatMap, finalize } from 'rxjs/operators';
import { LoggingService, LogLevel } from './logging.service';

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

  // Maximum number of retries to attempt when certificate isn't detected
  private readonly MAX_RETRIES = 3;

  // Base delay in milliseconds between retries (will be multiplied by retry count)
  private readonly BASE_RETRY_DELAY = 1000;

  // Subject to track the certificate fetch state
  private certificateState = new BehaviorSubject<'idle' | 'fetching' | 'success' | 'error'>('idle');

  // Observable to expose the certificate state
  public certificateState$ = this.certificateState.asObservable();

  // Flag to track if retries are in progress
  private isRetrying = false;

  constructor(
    private http: HttpClient,
    private logger: LoggingService
  ) {
    this.logger.info(this.SERVICE_NAME, 'Certificate service initialized with retry mechanism');
  }

  /**
   * Fetches the certificate information from the /me endpoint with automatic retries.
   * The endpoint returns the client's Distinguished Name (DN) in the X-Client-CN header.
   *
   * If no certificate is detected initially, this will automatically retry up to MAX_RETRIES times
   * with exponential backoff between attempts.
   *
   * @param forceRefresh If true, forces a fresh certificate request even if a certificate is already cached
   * @returns An Observable that emits the certificate DN or null if no certificate is present after all retries
   */
  public fetchCertificateInfo(forceRefresh: boolean = false): Observable<string | null> {
    const startTime = Date.now();

    // If we already have a certificate and aren't forcing a refresh, return it immediately
    if (this.certificateDN && !forceRefresh) {
      this.logger.info(this.SERVICE_NAME, 'Using cached certificate DN (set forceRefresh=true to refresh)',
        { certificateDN: this.certificateDN });
      return of(this.certificateDN);
    }

    // Update state to fetching
    this.certificateState.next('fetching');
    this.isRetrying = false;

    this.logger.info(this.SERVICE_NAME, 'Fetching certificate information from /me endpoint',
      { forceRefresh, maxRetries: this.MAX_RETRIES });

    // Check if the endpoint provides certificate presence information
    const checkForCertificate = (response: HttpResponse<any>): boolean => {
      const certificatePresent = response.headers.get('X-Certificate-Present');
      return certificatePresent === 'true';
    };

    // Check if we need to retry (no certificate detected)
    const shouldRetry = (response: HttpResponse<any>): boolean => {
      const clientCN = response.headers.get('X-Client-CN');
      const certificatePresent = checkForCertificate(response);

      // No retry needed if we have a certificate DN
      if (clientCN && clientCN.length > 0) {
        return false;
      }

      // Retry if the server explicitly says no certificate was presented
      return !certificatePresent;
    };

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
        const certificatePresent = checkForCertificate(response);

        // If no certificate and we should retry, throw a special error to trigger the retry mechanism
        if (shouldRetry(response)) {
          this.logger.warn(this.SERVICE_NAME, 'No certificate detected, will attempt retry', {
            attempt: this.isRetrying ? 'retry' : 'initial',
            certificatePresent
          });
          throw new Error('CERTIFICATE_NOT_DETECTED');
        }

        // Update state and cache the certificate DN
        this.certificateDN = clientCN;

        if (clientCN) {
          this.logger.info(this.SERVICE_NAME, 'Certificate DN found in response', {
            certificateDN: clientCN,
            elapsedTime
          });
          this.certificateState.next('success');
        } else {
          this.logger.warn(this.SERVICE_NAME, 'No Certificate DN found in response after all retries');
          this.certificateState.next('error');
        }

        return clientCN;
      }),

      // Implement retry with exponential backoff
      retryWhen(errors => {
        return errors.pipe(
          // Track retry count using scan
          scan((retryCount, error) => {
            // Only retry for certificate not detected errors
            if (error.message !== 'CERTIFICATE_NOT_DETECTED' || retryCount >= this.MAX_RETRIES) {
              throw error;
            }

            this.isRetrying = true;
            return retryCount + 1;
          }, 0),

          // Log retry attempt
          tap(retryCount => {
            const delay = this.BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
            this.logger.info(this.SERVICE_NAME, `Retrying certificate fetch (${retryCount}/${this.MAX_RETRIES})`, {
              delay
            });
          }),

          // Add exponential delay between retries
          delayWhen(retryCount => {
            const delay = this.BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
            return timer(delay);
          })
        );
      }),

      // Handle errors
      catchError(error => {
        const elapsedTime = Date.now() - startTime;

        // Don't log certificate not detected errors that were already handled in the retry mechanism
        if (error.message !== 'CERTIFICATE_NOT_DETECTED') {
          this.logger.error(
            this.SERVICE_NAME,
            `Error fetching certificate info (after ${elapsedTime}ms)`,
            error,
            {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              url: '/me',
              retriesExhausted: this.isRetrying
            }
          );
        } else if (this.isRetrying) {
          this.logger.warn(
            this.SERVICE_NAME,
            `Certificate not detected after ${this.MAX_RETRIES} retries`
          );
        }

        this.certificateState.next('error');
        return of(null);
      }),

      // Always reset the retrying flag when complete
      finalize(() => {
        this.isRetrying = false;
        const totalTime = Date.now() - startTime;
        this.logger.debug(this.SERVICE_NAME, `Certificate fetch process completed in ${totalTime}ms`, {
          outcome: this.certificateDN ? 'success' : 'failure'
        });
      })
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
   * @returns An Observable that emits the refreshed certificate DN or null if no certificate is present after all retries
   */
  public refreshCertificate(): Observable<string | null> {
    this.logger.info(this.SERVICE_NAME, 'Manually refreshing certificate information');

    // Clear the cached certificate
    this.certificateDN = null;

    // Force a refresh with retries
    return this.fetchCertificateInfo(true);
  }

  /**
   * Gets the current certificate state as a string.
   *
   * @returns The current certificate state: 'idle', 'fetching', 'success', or 'error'
   */
  public getCertificateState(): string {
    return this.certificateState.getValue();
  }

  /**
   * Checks if the certificate fetch is currently in progress.
   *
   * @returns True if the certificate is being fetched, false otherwise
   */
  public isFetching(): boolean {
    return this.certificateState.getValue() === 'fetching';
  }
}
