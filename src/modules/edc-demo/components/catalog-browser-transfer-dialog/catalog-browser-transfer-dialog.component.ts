import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageType } from '../../models/storage-type';

/**
 * Dialog component for configuring and submitting a data transfer destination
 */
@Component({
  selector: 'edc-demo-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog implements OnInit {

  selectedStorageType: string = 'rest'; // default to REST
  showPlaceholder = false;

  // REST-API Endpoint
  restConfig = {
    method: 'GET',
    url: '',
    auth: {
      type: 'vault' as 'vault' | 'value' | null,
      headerName: '',
      vaultSecretName: '',
      headerValue: '',
      visible: false,
    },
    additionalHeaders: [] as { name: string; value: string }[],
    payload: null as { contentType: string; body: string } | null,
  };

  // Amazon S3
  s3Config = {
    region: '',
    bucket: '',
    keyName: '',
    accessKey: '',
    secretKey: ''
  };

  // Azure Storage
  azureConfig = {
    account: '',
    sasToken: '',
    container: ''
  };

  constructor(
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  /** Resets all fields whenever the selected storage type is changed. */
  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  /** Clears all data source configuration fields for all storage types. */
  clearDatasourceFields(): void {
    // Reset REST fields
    this.restConfig.method = '';
    this.restConfig.url = '';
    this.restConfig.auth = {
      type: 'vault',
      headerName: '',
      vaultSecretName: '',
      headerValue: '',
      visible: false
    };
    this.restConfig.additionalHeaders = [];
    this.restConfig.payload = null;

    // Reset S3 fields
    this.s3Config = {
      region: '',
      bucket: '',
      keyName: '',
      accessKey: '',
      secretKey: ''
    };

    // Reset Azure fields
    this.azureConfig = {
      account: '',
      sasToken: '',
      container: ''
    };
  }

  /** Toggles the visibility of authentication configuration fields. */
  toggleAuth(): void {
    this.restConfig.auth.visible = !this.restConfig.auth.visible;
  }

  /** Toggles the presence of a request payload section. */
  togglePayload(): void {
    this.restConfig.payload = this.restConfig.payload
      ? null
      : { contentType: '', body: '' };
  }

  /** Adds an empty custom header field to the REST configuration. */
  addHeader(): void {
    this.restConfig.additionalHeaders.push({ name: '', value: '' });
  }

  /**
   * Removes a header at the given index from the REST config.
   * @param index Index of the header to remove
   */
  removeHeader(index: number): void {
    this.restConfig.additionalHeaders.splice(index, 1);
  }

  /**
   * Gathers the selected configuration into a `dataDestination` object
   * and closes the dialog, passing it back to the caller.
   */
  onTransfer(): void {
    let dataDestination: any = { type: this.selectedStorageType };

    if (this.selectedStorageType === 'rest') {
      dataDestination = {
        type: 'HttpData',
        method: this.restConfig.method,
        baseUrl: this.restConfig.url,
        authentication: this.restConfig.auth.visible
          ? {
            type: this.restConfig.auth.type,
            headerName: this.restConfig.auth.headerName,
            ...(this.restConfig.auth.type === 'vault'
              ? { vaultSecretName: this.restConfig.auth.vaultSecretName }
              : { headerValue: this.restConfig.auth.headerValue })
          }
          : undefined,
        headers: this.restConfig.additionalHeaders.length
          ? this.restConfig.additionalHeaders
          : undefined,
        payload: this.restConfig.payload || undefined
      };
    }

    if (this.selectedStorageType === 'amazonS3') {
      dataDestination = {
        type: 'AmazonS3',
        region: this.s3Config.region,
        bucketName: this.s3Config.bucket,
        keyName: this.s3Config.keyName,
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey
      };
    }

    if (this.selectedStorageType === 'azure') {
      dataDestination = {
        type: 'AzureStorage',
        account: this.azureConfig.account,
        container: this.azureConfig.container,
        sasToken: this.azureConfig.sasToken
      };
    }

    if (this.selectedStorageType === 'download') {
      dataDestination = {
        type: "HttpProxy",
      };
    }

    // Close dialog and return selected configuration
    this.dialogRef.close({ dataDestination });
  }
}
