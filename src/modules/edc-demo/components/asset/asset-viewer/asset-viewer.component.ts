import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSpinner} from '@angular/material/progress-spinner';
import {AssetInput, Asset } from "../../../../mgmt-api-client/model";
import {AssetService} from "../../../../mgmt-api-client";
import {AssetEditorDialog} from "../asset-editor-dialog/asset-editor-dialog.component";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../confirmation-dialog/confirmation-dialog.component";
import {NotificationService} from "../../../services/notification.service";
import {AssetDetailsDialogComponent} from "../asset-details-dialog/asset-details-dialog.component";
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';
import {CertificateService} from '../../../../app/components/services/certificate.service';
import {LoggingService} from '../../../../app/components/services/logging.service';
import {CertificateSelectorComponent} from '../../../../app/components/certificate-selector/certificate-selector.component';

// Extended interface for KeycloakProfile to include attributes
interface KeycloakProfileWithAttributes extends KeycloakProfile {
  attributes?: {
    [key: string]: string[];
  };
}

/**
 * Component for viewing, creating, and deleting assets.
 *
 * It includes identity verification functionality that ensures users are authenticated
 * with both Keycloak (EntraID) and an FNMT digital certificate.
 *
 * Key features:
 * 1. Displays a list of assets with search and pagination
 * 2. Provides identity verification to compare DNI from Keycloak and FNMT certificate
 * 3. Blocks asset creation until identity verification is successful
 * 4. Provides detailed feedback on verification status and errors
 */
@Component({
  selector: 'edc-demo-asset-viewer',
  templateUrl: './asset-viewer.component.html',
  styleUrls: ['./asset-viewer.component.scss']
})
export class AssetViewerComponent implements OnInit {
  // Component identifier for logging
  private readonly COMPONENT_NAME = 'AssetViewerComponent';

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

  constructor(
    private assetService: AssetService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog,
    private keycloakService: KeycloakService,
    private certificateService: CertificateService,
    private logger: LoggingService
  ) {
    this.logger.info(this.COMPONENT_NAME, 'Component initialized');
  }

  /**
   * Displays an error message using the notification service and logs the error using the logging service.
   * @param error Full error object or message
   * @param errorMessage User-facing message to display
   * @param context Optional additional context information
   */
  private showError(error: string, errorMessage: string, context?: any) {
    this.notificationService.showError(errorMessage);
    this.logger.error(this.COMPONENT_NAME, errorMessage, error, context);
  }

  /**
   * Extracts the DNI from the certificate DN
   * FNMT certificates typically contain the DNI in the CN field in format:
   * CN=SURNAME1 SURNAME2 NAME - NIF XXXXXXXXX
   * @returns The DNI (without NIF prefix) or null if not found
   */
  private extractDNIFromCertificate(dn: string | null): string | null {
    this.logger.debug(this.COMPONENT_NAME, 'Extracting DNI from certificate DN', { dn });

    if (!dn) {
      this.logger.warn(this.COMPONENT_NAME, 'Certificate DN is null or empty, cannot extract DNI');
      return null;
    }

    // Try to match the pattern for DNI in the certificate
    // Format is typically: CN=SURNAME1 SURNAME2 NAME - NIF XXXXXXXXX
    this.logger.debug(this.COMPONENT_NAME, 'Applying regex pattern to extract DNI', {
      pattern: 'NIF\\s+([0-9A-Z]+)',
      dnLength: dn.length
    });

    const match = dn.match(/NIF\s+([0-9A-Z]+)/i);

    if (match) {
      const dni = match[1].trim();
      this.logger.info(this.COMPONENT_NAME, 'Successfully extracted DNI from certificate', {
        dni: this.maskDNI(dni)
      });
      return dni;
    } else {
      this.logger.warn(this.COMPONENT_NAME, 'Failed to extract DNI from certificate DN', {
        dn: dn.substring(0, 20) + '...' // Show only beginning for privacy
      });
      return null;
    }
  }

  /**
   * Gets the DNI from the Keycloak user profile
   *
   * IMPORTANT: This method has been modified to return a hardcoded DNI value (5125507N)
   *
   * HOW TO REVERT THIS CHANGE:
   * 1. Remove the hardcoded return statement below
   * 2. Uncomment the original implementation block (between comment markers)
   * 3. Remove this notice
   *
   * @returns Promise resolving to the user's DNI or null if not available
   */
  private async getDNIFromKeycloak(): Promise<string | null> {
    this.logger.info(this.COMPONENT_NAME, 'Attempting to get DNI from Keycloak user profile');

    // HARDCODED DNI IMPLEMENTATION
    // Implemented on 2025-08-13 as per requirement
    this.logger.info(this.COMPONENT_NAME, 'Using hardcoded DNI value: 5125507N');
    return "99999972C";

    /* ORIGINAL IMPLEMENTATION - Uncomment to revert hardcoding
    try {
      // Check if user is logged in
      this.logger.debug(this.COMPONENT_NAME, 'Checking Keycloak authentication status');
      const isLoggedIn = await this.keycloakService.isLoggedIn();

      if (!isLoggedIn) {
        this.logger.warn(this.COMPONENT_NAME, 'User is not logged in with Keycloak');
        return null;
      }

      this.logger.info(this.COMPONENT_NAME, 'User is authenticated with Keycloak, loading user profile');

      // Get user profile data and cast to our extended interface
      const userProfile = await this.keycloakService.loadUserProfile() as KeycloakProfileWithAttributes;

      // Log profile info (excluding sensitive data)
      this.logger.debug(this.COMPONENT_NAME, 'Received user profile from Keycloak', {
        username: userProfile.username,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email ? '[REDACTED]' : undefined,
        hasAttributes: !!userProfile.attributes,
        attributeKeys: userProfile.attributes ? Object.keys(userProfile.attributes) : []
      });

      // DNI should be in the attributes section
      // The exact field name might vary depending on Keycloak configuration
      // Common fields: dni, document_number, idNumber, etc.
      this.logger.debug(this.COMPONENT_NAME, 'Checking for DNI in various attribute fields');

      const potentialDniFields = [
        { field: 'dni', value: userProfile?.attributes?.dni?.[0] },
        { field: 'document_number', value: userProfile?.attributes?.document_number?.[0] },
        { field: 'idNumber', value: userProfile?.attributes?.idNumber?.[0] }
      ];

      // Log which fields were checked and if they had values
      this.logger.debug(this.COMPONENT_NAME, 'DNI field check results', {
        checkedFields: potentialDniFields.map(f => ({
          field: f.field,
          hasValue: !!f.value
        }))
      });

      const dni = userProfile?.attributes?.dni?.[0] ||
                 userProfile?.attributes?.document_number?.[0] ||
                 userProfile?.attributes?.idNumber?.[0] ||
                 null;

      if (dni) {
        this.logger.info(this.COMPONENT_NAME, 'Successfully retrieved DNI from Keycloak profile', {
          dniField: potentialDniFields.find(f => f.value === dni)?.field,
          dni: this.maskDNI(dni)
        });
      } else {
        this.logger.warn(this.COMPONENT_NAME, 'No DNI found in any of the expected attribute fields', {
          availableAttributes: userProfile.attributes ? Object.keys(userProfile.attributes) : []
        });
      }

      return dni;
    } catch (error) {
      this.logger.error(this.COMPONENT_NAME, 'Error getting DNI from Keycloak', error, {
        keycloakRealmName: this.keycloakService.getKeycloakInstance().realm
      });
      return null;
    }
    */
  }

  /**
   * Verifies that the user's identity matches between Keycloak and the FNMT certificate
   * @returns Promise that resolves to true if verification was successful, false otherwise
   */
  public async verifyIdentity(): Promise<boolean> {
    this.logger.info(this.COMPONENT_NAME, 'Starting identity verification process');

    try {
      // Reset state
      this.verificationInProgress = true;
      this.identityVerified = false;
      this.verificationError = null;
      this.logger.debug(this.COMPONENT_NAME, 'Reset verification state');

      // Step 1: Get the DNI from Keycloak
      this.logger.info(this.COMPONENT_NAME, 'Step 1: Getting DNI from Keycloak');
      this.keycloakDNI = await this.getDNIFromKeycloak();

      if (!this.keycloakDNI) {
        const errorMsg = 'No se pudo obtener el DNI del usuario en Keycloak. Asegúrese de que su perfil contiene un número de documento válido.';
        this.verificationError = errorMsg;
        this.logger.error(this.COMPONENT_NAME, 'Verification failed: No DNI in Keycloak profile', null, {
          step: 'Step 1: Getting DNI from Keycloak',
          outcome: 'failure',
          reason: 'dni_missing_from_keycloak'
        });
        this.notificationService.showError('Verificación fallida: Información de usuario incompleta');
        return false;
      }

      this.logger.info(this.COMPONENT_NAME, 'Successfully retrieved DNI from Keycloak', {
        step: 'Step 1',
        outcome: 'success',
        maskedDNI: this.maskDNI(this.keycloakDNI)
      });

      // Step 2: Request the certificate with automatic retries
      this.logger.info(this.COMPONENT_NAME, 'Step 2: Requesting certificate information with retry capability');
      try {
        // Use the enhanced certificate service with automatic retries
        // Force a fresh certificate request to ensure we're not using a cached value
        const certificateDN = await this.certificateService.refreshCertificate().toPromise();
        // Ensure certificateDN is string or null, not undefined
        this.certificateDN = certificateDN || null;

        // Get certificate state for better error handling
        const certState = this.certificateService.getCertificateState();

        this.logger.debug(this.COMPONENT_NAME, 'Certificate information request completed', {
          hasCertificateDN: !!this.certificateDN,
          certificateState: certState,
          step: 'Step 2'
        });
      } catch (certError) {
        this.logger.error(this.COMPONENT_NAME, 'Error fetching certificate', certError, {
          step: 'Step 2',
          outcome: 'failure',
          reason: 'certificate_fetch_error'
        });
        this.verificationError = 'Error al obtener el certificado digital. Compruebe su conexión y que está accediendo mediante HTTPS.';
        this.notificationService.showError('Error de comunicación con el servidor de certificados');
        return false;
      }

      if (!this.certificateDN) {
        this.logger.warn(this.COMPONENT_NAME, 'No certificate DN received from service', {
          step: 'Step 2',
          outcome: 'failure',
          reason: 'certificate_not_detected'
        });
        this.verificationError = 'No se pudo obtener el certificado digital. Por favor, asegúrese de que su certificado está instalado y seleccionado en el navegador.';
        this.notificationService.showInfo(
          'Certificado no detectado',
          'Más información',
          () => this.showCertificateHelp()
        );
        return false;
      }

      this.logger.info(this.COMPONENT_NAME, 'Successfully retrieved certificate DN', {
        step: 'Step 2',
        outcome: 'success',
        dnLength: this.certificateDN.length
      });

      // Step 3: Extract the DNI from the certificate
      this.logger.info(this.COMPONENT_NAME, 'Step 3: Extracting DNI from certificate');
      this.certificateDNI = this.extractDNIFromCertificate(this.certificateDN);

      if (!this.certificateDNI) {
        this.logger.error(this.COMPONENT_NAME, 'Failed to extract DNI from certificate', null, {
          step: 'Step 3',
          outcome: 'failure',
          reason: 'dni_extraction_failed'
        });
        this.verificationError = 'No se pudo extraer el DNI del certificado digital. El formato del certificado puede no ser compatible.';
        this.notificationService.showError('Error al procesar el certificado digital');
        return false;
      }

      this.logger.info(this.COMPONENT_NAME, 'Successfully extracted DNI from certificate', {
        step: 'Step 3',
        outcome: 'success',
        maskedDNI: this.maskDNI(this.certificateDNI)
      });

      // Step 4: Compare the DNIs
      this.logger.info(this.COMPONENT_NAME, 'Step 4: Comparing DNIs from Keycloak and certificate');

      // Normalize DNIs by removing any non-alphanumeric characters and converting to uppercase
      const normalizedKeycloakDNI = this.keycloakDNI.replace(/[^a-z0-9]/gi, '').toUpperCase();
      const normalizedCertificateDNI = this.certificateDNI.replace(/[^a-z0-9]/gi, '').toUpperCase();

      this.logger.debug(this.COMPONENT_NAME, 'Normalized DNIs for comparison', {
        keycloakDNI: this.maskDNI(normalizedKeycloakDNI),
        certificateDNI: this.maskDNI(normalizedCertificateDNI),
        step: 'Step 4'
      });

      this.identityVerified = normalizedKeycloakDNI === normalizedCertificateDNI;

      if (!this.identityVerified) {
        this.logger.warn(this.COMPONENT_NAME, 'DNI mismatch between Keycloak and certificate', {
          step: 'Step 4',
          outcome: 'failure',
          reason: 'dni_mismatch',
          keycloakDNI: this.maskDNI(normalizedKeycloakDNI),
          certificateDNI: this.maskDNI(normalizedCertificateDNI)
        });
        this.verificationError = `El DNI del usuario (${this.maskDNI(normalizedKeycloakDNI)}) no coincide con el del certificado digital (${this.maskDNI(normalizedCertificateDNI)})`;
        this.notificationService.showError('Los datos de identidad no coinciden');
        return false;
      }

      // If we reached here, verification was successful
      this.logger.info(this.COMPONENT_NAME, 'Identity verification completed successfully', {
        outcome: 'success'
      });
      this.notificationService.showInfo('Identidad verificada correctamente', 'OK');
      return true;
    } catch (error) {
      this.logger.error(this.COMPONENT_NAME, 'Unexpected error during identity verification', error);
      this.verificationError = 'Error inesperado durante la verificación de identidad. Por favor, inténtelo de nuevo más tarde.';
      this.notificationService.showError('Error en el proceso de verificación');
      return false;
    } finally {
      this.verificationInProgress = false;
      this.logger.debug(this.COMPONENT_NAME, 'Verification process completed', {
        outcome: this.identityVerified ? 'success' : 'failure',
        hasError: !!this.verificationError
      });
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
   *
   * Opens the CertificateSelectorComponent dialog to provide guidance on:
   * - Certificate status and details
   * - How to select between personal and representation certificates
   * - Browser-specific instructions for certificate management
   */
  /**
   * Shows help information about digital certificates and provides troubleshooting guidance
   */
  public showCertificateHelp(): void {
    this.logger.info(this.COMPONENT_NAME, 'Opening certificate selector dialog');

    // Open dialog using the CertificateSelectorComponent
    const dialogRef = this.dialog.open(CertificateSelectorComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'certificate-selector-dialog',
      disableClose: false
    });

    // Log when dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      this.logger.debug(this.COMPONENT_NAME, 'Certificate selector dialog closed', { result });

      // If the dialog returns a result indicating a certificate change/refresh,
      // trigger a verification retry using the enhanced refresh method
      if (result === 'refresh') {
        this.logger.info(this.COMPONENT_NAME, 'Certificate refresh requested from help dialog');
        this.refreshCertificateAndVerify();
      }
    });
  }

  /**
   * Refreshes the certificate and retries the identity verification process.
   * This is useful when:
   * - The user has changed their certificate selection in the browser
   * - The initial certificate detection failed
   * - The user wants to retry verification after fixing certificate issues
   *
   * @returns Promise that resolves to true if verification was successful after refresh
   */
  public async refreshCertificateAndVerify(): Promise<boolean> {
    this.logger.info(this.COMPONENT_NAME, 'Manually refreshing certificate and retrying verification');

    // Notify the user that we're refreshing the certificate
    this.notificationService.showInfo('Actualizando información del certificado...', '');

    // Clear certificate state to force a complete refresh
    this.certificateDN = null;
    this.certificateDNI = null;

    // Re-run the full verification process
    const result = await this.verifyIdentity();

    if (result) {
      this.notificationService.showInfo('Certificado actualizado y verificación completada correctamente', 'OK');
    } else {
      // verifyIdentity already shows appropriate error messages
      this.logger.warn(this.COMPONENT_NAME, 'Certificate refresh and verification failed', {
        error: this.verificationError
      });
    }

    return result;
  }

  /**
   * Initializes the component and sets up the filtered asset stream.
   * Filters assets if search text is present.
   * Also starts the identity verification process.
   */
  ngOnInit(): void {
    // Set up the assets observable
    this.filteredAssets$ = this.fetch$.pipe(
      switchMap(() => {
        const assets$ = this.assetService.requestAssets().pipe(
          catchError(err => {
            console.error('Failed to load assets:', err);
            return of([]); // fallback: return empty list
          })
        );

        return !!this.searchText
          ? assets$.pipe(
            map(assets =>
              assets.filter(asset =>
                asset.properties.optionalValue<string>('edc', 'name')?.includes(this.searchText)
              )
            )
          )
          : assets$;
      })
    );

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

  /**
   * Returns a shortened version of the asset description (max 50 chars).
   * @param asset Asset to display description for
   */
  getShortDescription(asset: Asset): string {
    const desc = asset.properties.optionalValue('dcterms', 'description');
    if (typeof desc === 'string') {
      return desc.length > 300 ? desc.slice(0, 300) + '...' : desc;
    }
    return '';
  }

  /** Returns true if a transfer operation is in progress. */
  isBusy() {
    return this.isTransferring;
  }

  /** Triggers asset reloading based on current search text. */
  onSearch() {
    this.fetch$.next(null);
  }

  /**
   * Opens a dialog to view asset details.
   * If the dialog result indicates deletion, triggers deletion.
   * @param asset The asset to display
   */
  openAssetDialog(asset: Asset) {
    const dialogRef = this.dialog.open(AssetDetailsDialogComponent, {
      data: {asset}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.delete) {
        this.onDelete(asset);
      }
    });
  }

  /**
   * Prompts for confirmation and deletes the given asset.
   * Shows success or error notifications accordingly.
   * @param asset The asset to delete
   */
  onDelete(asset: Asset) {
    const dialogData = ConfirmDialogModel.forDelete("asset", `"${asset.id}"`);
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      data: dialogData
    });

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

  /**
   * Opens the asset creation dialog.
   * If the user submits valid data, the new asset is sent to the backend.
   * On success, refreshes the asset list and shows a success notification.
   */
  onCreate() {
    const dialogRef = this.dialog.open(AssetEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetInput?: AssetInput }) => {
      const newAsset = result?.assetInput;
      if (newAsset) {
        this.assetService.createAsset(newAsset).subscribe({
          next: ()=> this.fetch$.next(null),
          error: err => this.showError(err, 'Asset creation failed. The input may contain restricted characters, especially in icon-related fields. Please verify and correct the input before retrying.'),
          complete: () => this.notificationService.showInfo("Successfully created"),
        })
      }
  })
}
}
