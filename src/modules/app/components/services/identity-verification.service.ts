import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { CertificateService } from './certificate.service';
import { LoggingService } from './logging.service';

export interface IdentityVerificationResult {
  certificateDN: string | null;
  dniFromCert: string | null;
  dniFromKeycloak: string | null;
  verified: boolean;
  errorMessage?: string | null;
}

interface KeycloakProfileWithAttributes extends KeycloakProfile {
  attributes?: { [key: string]: string[] };
}

@Injectable({ providedIn: 'root' })
export class IdentityVerificationService {
  private readonly SERVICE_NAME = 'IdentityVerificationService';

  constructor(
    private readonly keycloak: KeycloakService,
    private readonly certService: CertificateService,
    private readonly logger: LoggingService,
  ) {}

  // Robust DNI/NIE extractor used across the app
  public extractDNIFromDN(dnRaw: string | null | undefined): string | null {
    if (!dnRaw) return null;
    const upper = String(dnRaw).toUpperCase();
    const dniPattern = '(?:[XYZ][0-9]{7}|[0-9]{8})[A-Z]';

    // 1) serialNumber=IDCES-<DNI>
    let m = upper.match(new RegExp(`SERIALNUMBER\\s*=\\s*IDCES-(${dniPattern})`));
    if (m) return m[1];

    // 2) CN with trailing "- <DNI>"
    m = upper.match(new RegExp(`CN\\s*=[^,]*-\\s*(${dniPattern})`));
    if (m) return m[1];

    // 3) Generic fallback: any isolated DNI-like token
    m = upper.match(new RegExp(`(?:^|[\\s,=:-])(${dniPattern})(?:$|[\\s,=:-])`));
    if (m) return m[1];

    return null;
  }

  public async getDNIFromKeycloak(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloak.isLoggedIn();
      if (!isLoggedIn) {
        this.logger.warn(this.SERVICE_NAME, 'User not logged in to Keycloak');
        return null;
      }

      // HARDCODED DNI IMPLEMENTATION
      this.logger.info(this.SERVICE_NAME, 'Using hardcoded DNI value: 99999999R');
      return "99999999R";

      /* Original implementation - commented out as per requirement
      const profile = await this.keycloak.loadUserProfile() as KeycloakProfileWithAttributes;
      const dni = profile?.attributes?.dni?.[0]
        || profile?.attributes?.document_number?.[0]
        || profile?.attributes?.idNumber?.[0]
        || null;

      if (!dni) {
        this.logger.warn(this.SERVICE_NAME, 'DNI not found in Keycloak attributes', {
          attributes: profile?.attributes ? Object.keys(profile.attributes) : []
        });
      }
      return dni;
      */
    } catch (err) {
      this.logger.error(this.SERVICE_NAME, 'Error loading Keycloak profile', err);
      return null;
    }
  }

  public async getCertificateDN(): Promise<string | null> {
    try {
      const dn = await this.certService.fetchCertificateInfo(true).toPromise();
      return dn || null;
    } catch (err) {
      this.logger.error(this.SERVICE_NAME, 'Error fetching certificate DN', err);
      return null;
    }
  }

  public async verifyIdentity(): Promise<IdentityVerificationResult> {
    this.logger.info(this.SERVICE_NAME, 'Starting identity verification');

    const dniKeycloak = await this.getDNIFromKeycloak();
    if (!dniKeycloak) {
      return { certificateDN: null, dniFromCert: null, dniFromKeycloak: null, verified: false, errorMessage: 'No DNI in Keycloak profile' };
    }

    const certDN = await this.getCertificateDN();
    if (!certDN) {
      return { certificateDN: null, dniFromCert: null, dniFromKeycloak: dniKeycloak, verified: false, errorMessage: 'Certificate not detected' };
    }

    const dniFromCert = this.extractDNIFromDN(certDN);
    if (!dniFromCert) {
      return { certificateDN: certDN, dniFromCert: null, dniFromKeycloak: dniKeycloak, verified: false, errorMessage: 'Cannot extract DNI from certificate' };
    }

    const normalize = (v: string) => v.replace(/[^a-z0-9]/gi, '').toUpperCase();
    const verified = normalize(dniKeycloak) === normalize(dniFromCert);

    return { certificateDN: certDN, dniFromCert, dniFromKeycloak: dniKeycloak, verified };
  }
}
