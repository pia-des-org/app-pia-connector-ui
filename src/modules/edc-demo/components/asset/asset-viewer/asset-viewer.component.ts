import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AssetInput, Asset } from "../../../../mgmt-api-client/model";
import {AssetService} from "../../../../mgmt-api-client";
import {AssetEditorDialog} from "../asset-editor-dialog/asset-editor-dialog.component";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../confirmation-dialog/confirmation-dialog.component";
import {NotificationService} from "../../../services/notification.service";
import {AssetDetailsDialogComponent} from "../asset-details-dialog/asset-details-dialog.component";
import {LoggingService} from '../../../../app/components/services/logging.service';
import {IdentityVerificationService, IdentityVerificationResult} from '../../../../app/components/services/identity-verification.service';


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

  filteredAssets$: Observable<Asset[]> = of<Asset[]>([]);
  searchText = '';
  isTransferring = false;
  private fetch$ = new BehaviorSubject(null);

  // Identity verification state
  // Mantener siempre el botón habilitado: por defecto true
  identityVerified = true;
  verificationInProgress = false;
  verificationError: string | null = null;
  certificateDN: string | null = null;
  certificateDNI: string | null = null;
  keycloakDNI: string | null = null;

  constructor(
    private assetService: AssetService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog,
    private identityService: IdentityVerificationService,
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
   * Verifies that the user's identity matches between Keycloak and the FNMT certificate
   * @returns Promise that resolves to true if verification was successful, false otherwise
   */
  public async verifyIdentity(): Promise<boolean> {
    this.logger.info(this.COMPONENT_NAME, 'Starting identity verification process');

    // Reset state (no deshabilitar el botón: no forzar identityVerified=false)
    this.verificationInProgress = true;
    this.verificationError = null;

    try {
      const result: IdentityVerificationResult = await this.identityService.verifyIdentity();

      // Update local state for UI
      this.certificateDN = result.certificateDN;
      this.certificateDNI = result.dniFromCert;
      this.keycloakDNI = result.dniFromKeycloak;

      if (!result.verified) {
        const msg =
          result.errorMessage === 'No DNI in Keycloak profile'
            ? 'No se pudo obtener el DNI del usuario en Keycloak. Asegúrese de que su perfil contiene un número de documento válido.'
            : result.errorMessage === 'Certificate not detected'
            ? 'No se pudo obtener el certificado digital. Asegúrese de que su certificado personal FNMT está instalado y que accede por HTTPS.'
            : result.errorMessage === 'Cannot extract DNI from certificate'
            ? 'No se pudo extraer el DNI del certificado digital.'
            : 'Verificación de identidad no válida.';

        this.verificationError = msg;
        this.notificationService.showError(msg);
        // Mantener identityVerified en true para no bloquear el botón
        return false;
      }

      // Verificación correcta (identityVerified ya está en true)
      this.notificationService.showInfo('Identidad verificada correctamente', 'OK');
      return true;
    } catch (error) {
      this.logger.error(this.COMPONENT_NAME, 'Unexpected error during identity verification', error);
      this.verificationError = 'Error inesperado durante la verificación de identidad. Por favor, inténtelo de nuevo más tarde.';
      this.notificationService.showError('Error en el proceso de verificación');
      // Mantener identityVerified en true para no bloquear el botón
      return false;
    } finally {
      this.verificationInProgress = false;
      this.logger.debug(this.COMPONENT_NAME, 'Verification process completed', {
        outcome: 'non-blocking',
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
            return of<Asset[]>([]); // asegura Observable<Asset[]>
          })
        );

        return !!this.searchText
          ? assets$.pipe(
              map((assets: Asset[]) =>
                assets.filter(asset =>
                  asset.properties.optionalValue<string>('edc', 'name')?.includes(this.searchText)
                )
              )
            )
          : assets$;
      })
    );

    // Lanzar verificación inicial (informativa, no bloqueante)
    this.verifyIdentity().then(verified => {
      if (!verified) {
        this.notificationService.showInfo(
          'Puede verificar su identidad para mejorar la trazabilidad y seguridad.',
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

    dialogRef.afterClosed().subscribe((result: { delete: any; }) => {
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
