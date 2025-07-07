import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asset } from '../../../../mgmt-api-client/model';

@Component({
  selector: 'edc-demo-asset-details-dialog',
  templateUrl: './asset-details-dialog.component.html',
  styleUrls: ['./asset-details-dialog.component.scss']
})
export class AssetDetailsDialogComponent {
<<<<<<< HEAD
  keyMap = {
    name: 'https://w3id.org/edc/v0.0.1/ns/name',
    description: 'https://w3id.org/edc/v0.0.1/ns/description',
    ontologyType: 'https://w3id.org/edc/v0.0.1/ns/ontologyType',
    datasourceType: 'https://w3id.org/edc/v0.0.1/ns/type',
    contentType: 'https://w3id.org/edc/v0.0.1/ns/contentType',
  };

=======
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { asset: Asset },
    private dialogRef: MatDialogRef<AssetDetailsDialogComponent>
  ) {}

<<<<<<< HEAD
=======
  formatKeywords(raw: any): string {
    if (Array.isArray(raw)) {
      return raw.join('; ');
    }
    return typeof raw === 'string' ? raw : '-';
  }

>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  mapDatasourceType(raw: string): string {
    const map = {
      HttpData: 'REST-API endpoint',
      AmazonS3: 'Amazon S3',
      AzureStorage: 'Azure Blob Storage'
    };

    return map[raw as keyof typeof map] || raw || '-';
  }

<<<<<<< HEAD

  getNestedProp(fullKey: string): string {
    const props = this.data.asset?.properties || {};
    const valueArray = props[fullKey];
    if (Array.isArray(valueArray) && valueArray.length > 0) {
      return valueArray[0]['@value'] || '-';
    }
    return '-';
  }

  getDataAddressProp(fullKey: string): string {
    const dataAddressArr = this.data.asset?.['https://w3id.org/edc/v0.0.1/ns/dataAddress'];
    if (Array.isArray(dataAddressArr) && dataAddressArr.length > 0) {
      const valueArray = dataAddressArr[0]?.[fullKey];
      if (Array.isArray(valueArray) && valueArray.length > 0) {
        return valueArray[0]['@value'] || '-';
      }
    }
    return '-';
  }



=======
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close({ delete: true });
  }
}
