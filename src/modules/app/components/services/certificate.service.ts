import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  /**
   * Fetches the certificate information from the /me endpoint.
   * The endpoint returns the client's Distinguished Name (DN) in the X-Client-CN header.
   *
   * @returns An Observable that emits the certificate DN or null if no certificate is present
   */
  public fetchCertificateInfo(): Observable<string | null> {
    return this.http.get('/me', { observe: 'response' })
      .pipe(
        map(response => {
          const clientCN = response.headers.get('X-Client-CN');
          this.certificateDN = clientCN;
          return clientCN;
        }),
        catchError(error => {
          console.error('Error fetching certificate info:', error);
          return of(null);
        })
      );
  }

  /**
   * Gets the cached certificate DN.
   *
   * @returns The certificate DN or null if not available
   */
  public getCertificateDN(): string | null {
    return this.certificateDN;
  }

  /**
   * Checks if a valid certificate is present.
   *
   * @returns True if a certificate is present, false otherwise
   */
  public hasCertificate(): boolean {
    return !!this.certificateDN;
  }

  /**
   * Extracts the organization name from the certificate DN.
   * The DN format is typically: CN=name, O=organization, C=country
   *
   * @returns The organization name or null if not available
   */
  public getOrganizationFromCertificate(): string | null {
    if (!this.certificateDN) {
      return null;
    }

    // Extract the organization (O=) from the DN
    const match = this.certificateDN.match(/O=([^,]+)/i);
    return match ? match[1].trim() : null;
  }
}
