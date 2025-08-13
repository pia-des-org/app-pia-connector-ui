import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { LoggingService } from '../services/logging.service';

interface CertificateInfo {
  subject: {
    CN?: string;
    O?: string;
    C?: string;
    serialNumber?: string;
    GN?: string;
    SN?: string;
    [key: string]: string | undefined;
  };
  issuer: {
    CN?: string;
    O?: string;
    C?: string;
    OU?: string;
    [key: string]: string | undefined;
  };
  validFrom: string;
  validTo: string;
}

interface CertificateDebugInfo {
  caRootExists: boolean;
  caIntermediateExists: boolean;
  caUsuariosExists: boolean;
  caFilesLoaded: number;
  clientProvided: boolean;
  clientAuthorized: boolean;
  authorizationError: string;
  clientCertInfo: CertificateInfo | null;
}

@Component({
  selector: 'app-certificate-selector',
  templateUrl: './certificate-selector.component.html',
  styleUrls: ['./certificate-selector.component.scss']
})
export class CertificateSelectorComponent implements OnInit {
  certificateInfo: CertificateDebugInfo | null = null;
  loading = true;
  error: string | null = null;
  // Removed 'representation' type as per requirements
  detectedCertificateType: 'personal' | 'unknown' | null = null;
  browserName: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<CertificateSelectorComponent>,
    private http: HttpClient,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.detectBrowser();
    this.fetchCertificateInfo();
  }

  private detectBrowser(): void {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('edg') > -1) {
      this.browserName = 'Edge';
    } else if (userAgent.indexOf('chrome') > -1) {
      this.browserName = 'Chrome';
    } else if (userAgent.indexOf('firefox') > -1) {
      this.browserName = 'Firefox';
    } else if (userAgent.indexOf('safari') > -1) {
      this.browserName = 'Safari';
    } else {
      this.browserName = 'Otro navegador';
    }
  }

  private fetchCertificateInfo(): void {
    this.loading = true;
    this.error = null;

    this.http.get<CertificateDebugInfo>('/cert-debug').subscribe({
      next: (info) => {
        this.certificateInfo = info;
        this.determineDetectedCertificateType();
        this.loading = false;
      },
      error: (err) => {
        this.logger.error('CertificateSelectorComponent', 'Failed to fetch certificate info', err);
        this.error = 'Error al obtener información del certificado. Por favor, asegúrese de que está accediendo mediante HTTPS.';
        this.loading = false;
      }
    });
  }

  private determineDetectedCertificateType(): void {
    if (!this.certificateInfo?.clientCertInfo?.issuer?.CN) {
      this.detectedCertificateType = null;
      return;
    }

    const issuerCN = this.certificateInfo.clientCertInfo.issuer.CN;

    // Removed representation certificate detection as per requirements
    if (issuerCN.includes('Usuarios') || issuerCN.includes('Ciudadanos')) {
      this.detectedCertificateType = 'personal';
    } else {
      this.detectedCertificateType = 'unknown';
    }
  }

  refreshCertificate(): void {
    this.fetchCertificateInfo();
  }

  openBrowserCertificateSettings(): void {
    switch(this.browserName) {
      case 'Chrome':
        window.open('chrome://settings/certificates', '_blank');
        break;
      case 'Edge':
        window.open('edge://settings/certificates', '_blank');
        break;
      case 'Firefox':
        window.open('about:preferences#privacy', '_blank');
        break;
      default:
        alert('Por favor, abra la configuración de certificados en su navegador.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // This method has been modified as per requirements
  // Previously checked for company info, now always returns false since we only support personal certificates
  hasCompanyInfo(): boolean {
    return false;
  }

  // Returns the DN from certificate subject
  // Removed organization field as per requirements
  getSubjectDN(): string {
    const subject = this.certificateInfo?.clientCertInfo?.subject;
    if (!subject) return '';

    const parts = [];
    if (subject.CN) parts.push(`CN=${subject.CN}`);
    // Removed organization (O) field as we only support personal certificates
    if (subject.C) parts.push(`C=${subject.C}`);
    if (subject.serialNumber) parts.push(`SERIALNUMBER=${subject.serialNumber}`);

    return parts.join(', ');
  }

  // Returns the DN from certificate issuer
  // Removed organization field as per requirements
  getIssuerDN(): string {
    const issuer = this.certificateInfo?.clientCertInfo?.issuer;
    if (!issuer) return '';

    const parts = [];
    if (issuer.CN) parts.push(`CN=${issuer.CN}`);
    // Kept FNMT organization info as it's part of all certificates
    if (issuer.O) parts.push(`O=${issuer.O}`);
    if (issuer.OU) parts.push(`OU=${issuer.OU}`);
    if (issuer.C) parts.push(`C=${issuer.C}`);

    return parts.join(', ');
  }
}
