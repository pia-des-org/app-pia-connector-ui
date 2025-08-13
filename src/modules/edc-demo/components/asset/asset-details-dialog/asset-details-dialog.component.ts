import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asset } from '../../../../mgmt-api-client/model';

/**
 * Dialog component for showing asset details.
 */
@Component({
  selector: 'edc-demo-asset-details-dialog',
  templateUrl: './asset-details-dialog.component.html',
  styleUrls: ['./asset-details-dialog.component.scss']
})
export class AssetDetailsDialogComponent {
  /**
   * Accepts asset data via MAT_DIALOG_DATA injection.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { asset: Asset },
    private dialogRef: MatDialogRef<AssetDetailsDialogComponent>
  ) {}

  /**
   * Converts keywords to a string for display.
   * Joins arrays with '; ', returns string as-is, or '-' if invalid.
   */
  formatKeywords(raw: any): string {
    if (Array.isArray(raw)) {
      return raw.join('; ');
    }
    return typeof raw === 'string' ? raw : '-';
  }

  /**
   * Maps internal datasource type names to user-friendly labels.
   */
  mapDatasourceType(raw: string): string {
    const map = {
      HttpData: 'REST-API endpoint',
      AmazonS3: 'Amazon S3',
      AzureStorage: 'Azure Blob Storage'
    };

    return map[raw as keyof typeof map] || raw || '-';
  }

  /**
   * Closes the dialog.
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the dialog and signals deletion.
   */
  delete(): void {
    this.dialogRef.close({ delete: true });
  }
}
