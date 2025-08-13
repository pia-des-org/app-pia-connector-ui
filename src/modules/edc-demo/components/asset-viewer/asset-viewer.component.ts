import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { AssetInput, Asset } from '../../../mgmt-api-client/model';
import { AssetService } from '../../../mgmt-api-client';
import { AssetEditorDialog } from '../asset-editor-dialog/asset-editor-dialog.component';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { CertificateService } from '../../../app/components/services/certificate.service';

// Extended interface for KeycloakProfile to include attributes
interface KeycloakProfileWithAttributes extends KeycloakProfile {
  attributes?: {
    [key: string]: string[];
  };
}


/**
 * AssetViewerComponent
 *
 * This component displays assets and allows users to create new assets.
 * It includes identity verification functionality that ensures users are authenticated
 * with both Keycloak (EntraID) and an FNMT digital certificate.
 *
 * Key features:
 * 1. Displays a list of assets with search and pagination
 * 2. Provides identity verification to compare DNI from Keycloak and FNMT certificate
 * 3. Blocks asset creation until identity verification is successful
 * 4. Provides detailed feedback on verification status and errors
 *
 * The verification process:
 * - Retrieves user DNI from Keycloak profile attributes
 * - Requests FNMT certificate from the /me endpoint
 * - Extracts DNI from the certificate's Distinguished Name
 * - Compares both DNIs and validates they match
 * - Provides appropriate error messages and guidance if verification fails
 *
 * Security considerations:
 * - Asset creation is disabled until identity verification succeeds
 * - DNI values are masked when displayed for privacy
 * - Helpful error messages guide users through verification issues
 */
@Component({
  selector: 'edc-demo-asset-viewer',
  templateUrl: './asset-viewer.component.html',
  styleUrls: ['./asset-viewer.component.scss']
})
export class AssetViewerComponent implements OnInit {

  filteredAssets$: Observable<Asset[]> = of([]);
  searchText = '';
  isTransferring = false;
  private fetch$ = new BehaviorSubject(null);

  // Identity verification state
  identityVerified = false;
  verificationInProgress = false;
  verificationError: string | null = null;
  certificateDN: string | null = null;
  certificateDNI: string | null = null;
  keycloakDNI: string | null = null;

  constructor(private assetService: AssetService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog,
              private keycloakService: KeycloakService,
              private certificateService: CertificateService) {
}

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  /**
   * Extracts the DNI from the certificate DN
   * FNMT certificates typically contain the DNI in the CN field in format:
   * CN=SURNAME1 SURNAME2 NAME - NIF XXXXXXXXX
   * @returns The DNI (without NIF prefix) or null if not found
   */
  private extractDNIFromCertificate(dn: string | null): string | null {
    if (!dn) {
      return null;
    }

    // Try to match the pattern for DNI in the certificate
    // Format is typically: CN=SURNAME1 SURNAME2 NAME - NIF XXXXXXXXX
    const match = dn.match(/NIF\s+([0-9A-Z]+)/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Gets the DNI from the Keycloak user profile
   * @returns Promise resolving to the user's DNI or null if not available
   */
  private async getDNIFromKeycloak(): Promise<string | null> {
    try {
      // Check if user is logged in
      const isLoggedIn = this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        return null;
      }

      // Get user profile data and cast to our extended interface
      const userProfile = await this.keycloakService.loadUserProfile() as KeycloakProfileWithAttributes;

      // DNI should be in the attributes section
      // The exact field name might vary depending on Keycloak configuration
      // Common fields: dni, document_number, idNumber, etc.
      return userProfile?.attributes?.dni?.[0] ||
             userProfile?.attributes?.document_number?.[0] ||
             userProfile?.attributes?.idNumber?.[0] ||
             null;
    } catch (error) {
      console.error('Error getting DNI from Keycloak:', error);
      return null;
    }
  }

  /**
   * Verifies that the user's identity matches between Keycloak and the FNMT certificate
   * @returns Promise that resolves to true if verification was successful, false otherwise
   */
  public async verifyIdentity(): Promise<boolean> {
    try {
      // Reset state
      this.verificationInProgress = true;
      this.identityVerified = false;
      this.verificationError = null;

      // Step 1: Get the DNI from Keycloak
      this.keycloakDNI = await this.getDNIFromKeycloak();
      if (!this.keycloakDNI) {
        this.verificationError = 'No se pudo obtener el DNI del usuario en Keycloak. Asegúrese de que su perfil contiene un número de documento válido.';
        this.notificationService.showError('Verificación fallida: Información de usuario incompleta');
        return false;
      }

      // Step 2: Request the certificate if not already done
      try {
        const certificateDN = await this.certificateService.fetchCertificateInfo().toPromise();
        // Ensure certificateDN is string or null, not undefined
        this.certificateDN = certificateDN || null;
      } catch (certError) {
        console.error('Error fetching certificate:', certError);
        this.verificationError = 'Error al obtener el certificado digital. Compruebe su conexión y que está accediendo mediante HTTPS.';
        this.notificationService.showError('Error de comunicación con el servidor de certificados');
        return false;
      }

      if (!this.certificateDN) {
        this.verificationError = 'No se pudo obtener el certificado digital. Por favor, asegúrese de que su certificado está instalado y seleccionado en el navegador.';
        this.notificationService.showInfo(
          'Certificado no detectado',
          'Más información',
          () => this.showCertificateHelp()
        );
        return false;
      }

      // Step 3: Extract the DNI from the certificate
      this.certificateDNI = this.extractDNIFromCertificate(this.certificateDN);
      if (!this.certificateDNI) {
        this.verificationError = 'No se pudo extraer el DNI del certificado digital. El formato del certificado puede no ser compatible.';
        this.notificationService.showError('Error al procesar el certificado digital');
        return false;
      }

      // Step 4: Compare the DNIs
      // Normalize DNIs by removing any non-alphanumeric characters and converting to uppercase
      const normalizedKeycloakDNI = this.keycloakDNI.replace(/[^a-z0-9]/gi, '').toUpperCase();
      const normalizedCertificateDNI = this.certificateDNI.replace(/[^a-z0-9]/gi, '').toUpperCase();

      this.identityVerified = normalizedKeycloakDNI === normalizedCertificateDNI;

      if (!this.identityVerified) {
        this.verificationError = `El DNI del usuario (${this.maskDNI(normalizedKeycloakDNI)}) no coincide con el del certificado digital (${this.maskDNI(normalizedCertificateDNI)})`;
        this.notificationService.showError('Los datos de identidad no coinciden');
        return false;
      }

      // If we reached here, verification was successful
      this.notificationService.showInfo('Identidad verificada correctamente', 'OK');
      return true;
    } catch (error) {
      console.error('Error durante la verificación de identidad:', error);
      this.verificationError = 'Error inesperado durante la verificación de identidad. Por favor, inténtelo de nuevo más tarde.';
      this.notificationService.showError('Error en el proceso de verificación');
      return false;
    } finally {
      this.verificationInProgress = false;
    }
  }

  /**
   * Masks a DNI for display, showing only the first and last two characters
   * @param dni The DNI to mask
   * @returns The masked DNI
   */
  private maskDNI(dni: string): string {
    if (!dni || dni.length < 4) {
      return dni;
    }
    const firstTwo = dni.substring(0, 2);
    const lastTwo = dni.substring(dni.length - 2);
    return `${firstTwo}...${lastTwo}`;
  }

  /**
   * Shows help information about digital certificates
   */
  private showCertificateHelp(): void {
    // Use the confirmation dialog component that already exists in the project
    // But adapt it to show help information
    const dialogData = {
      title: 'Ayuda con Certificados Digitales',
      message: `
        <h3>¿Cómo instalar su certificado digital?</h3>
        <p>Para utilizar esta aplicación, necesita tener instalado su certificado digital de la FNMT en su navegador.</p>
        <ol>
          <li>Descargue su certificado desde la web de la FNMT</li>
          <li>Importe el certificado en su navegador (normalmente en Configuración > Privacidad y Seguridad > Certificados)</li>
          <li>Asegúrese de que está accediendo a la aplicación mediante HTTPS</li>
          <li>Cuando se le solicite, seleccione su certificado digital</li>
        </ol>
        <p>Para más información, visite la <a href="https://www.sede.fnmt.gob.es/certificados" target="_blank">página oficial de la FNMT</a>.</p>
      `,
      buttonText: {
        ok: 'Entendido'
      },
      data: {
        isInfo: true  // This can be used to style the dialog differently
      }
    };

    // Open dialog using the ConfirmationDialogComponent
    this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '500px',
      data: dialogData
    });
  }

  ngOnInit(): void {
    // Set up the assets observable
    this.filteredAssets$ = this.fetch$
      .pipe(
        switchMap(() => {
          const assets$ = this.assetService.requestAssets();
          return !!this.searchText
            ? assets$.pipe(map(assets => assets.filter(asset => asset.properties.optionalValue<string>('edc', 'name')?.includes(this.searchText))))
            : assets$;
        }));

    // Trigger initial identity verification
    this.verifyIdentity().then(verified => {
      if (!verified) {
        // If not verified, show a notification to the user
        this.notificationService.showInfo(
          'Se requiere verificación de identidad para crear assets',
          'Verificar',
          () => this.verifyIdentity()
        );
      }
    }).catch(error => {
      console.error('Error during initial identity verification:', error);
      this.verificationError = 'Error al iniciar la verificación de identidad';
    });
  }

  isBusy() {
    return this.isTransferring;
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onDelete(asset: Asset) {
    const dialogData = ConfirmDialogModel.forDelete("asset", `"${asset.id}"`)
    const ref = this.dialog.open(ConfirmationDialogComponent, {maxWidth: "20%", data: dialogData});

    ref.afterClosed().subscribe({
      next: res => {
        if (res) {
          this.assetService.removeAsset(asset.id).subscribe({
            next: () => this.fetch$.next(null),
            error: err => this.showError(err, "This asset cannot be deleted"),
            complete: () => this.notificationService.showInfo("Successfully deleted")
          });
        }
      }
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(AssetEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetInput?: AssetInput }) => {
      const newAsset = result?.assetInput;
      if (newAsset) {
        this.assetService.createAsset(newAsset).subscribe({
          next: ()=> this.fetch$.next(null),
          error: err => this.showError(err, "This asset cannot be created"),
          complete: () => this.notificationService.showInfo("Successfully created"),
        })
      }
  })
}
}
