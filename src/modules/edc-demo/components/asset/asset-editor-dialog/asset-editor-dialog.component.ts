import { Component, Inject, OnInit } from '@angular/core';
<<<<<<< HEAD
import { AssetInput } from '@think-it-labs/edc-connector-client';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageType } from '../../../models/storage-type';
=======
import { MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { AssetInput } from '@think-it-labs/edc-connector-client';
import { StorageType } from '../../../models/storage-type';
import { NS, CONTEXT_MAP } from '../../namespaces';
import {EcosystemService} from "../../../../app/components/services/ecosystem.service";
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43

@Component({
  selector: 'edc-demo-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog implements OnInit {
<<<<<<< HEAD

  // General Information
=======
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  assetMetadata = {
    name: '',
    id: '',
    description: '',
    ontologyType: 'Organization',
<<<<<<< HEAD
    keywords: '',
=======
    keywords: [] as string[],
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
    mediaType: '',
    qualityNote: '',
    language: ''
  };

<<<<<<< HEAD
  // Datasource Information
  selectedStorageType: string = 'rest';
  showPlaceholder = false;
  // REST-API Endpoint
=======
  selectedStorageType: string = 'rest';
  showPlaceholder = false;

>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
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
<<<<<<< HEAD
  // Amazon S3
=======

>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  s3Config = {
    region: '',
    bucket: '',
    keyName: '',
    accessKey: '',
    secretKey: ''
  };
<<<<<<< HEAD
  // AZURE
  azureConfig = {
    account: '',
    keyName: '',
    container: '',
    blobName: ''
  }

  // UI Sections
=======

  azureConfig = {
    account: '',
    sasToken: '',
    container: '',
    blobName: ''
  };

>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  section = {
    general: true,
    datasource: false
  };

  constructor(
    private dialogRef: MatDialogRef<AssetEditorDialog>,
<<<<<<< HEAD
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[]
=======
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private ecosystemService: EcosystemService
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  ) {}

  ngOnInit(): void {}

<<<<<<< HEAD
  toggleSection(target: 'general' | 'datasource'): void {
    if (this.section[target]) return;

=======
  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.assetMetadata.keywords.push(value);
    }
    event.chipInput?.clear();
  }

  removeKeyword(keyword: string): void {
    const index = this.assetMetadata.keywords.indexOf(keyword);
    if (index >= 0) {
      this.assetMetadata.keywords.splice(index, 1);
    }
  }

  toggleSection(target: 'general' | 'datasource'): void {
    if (this.section[target]) return;
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
    if (target === 'datasource' && !this.isGeneralValid()) return;

    this.section.general = false;
    this.section.datasource = false;
    this.section[target] = true;
  }

  isGeneralValid(): boolean {
<<<<<<< HEAD
    return!!this.assetMetadata.name?.trim()
      && !!this.assetMetadata.id?.trim()
      && !!this.assetMetadata.description?.trim()
      && !!this.assetMetadata.keywords?.trim()
      && !!this.assetMetadata.mediaType?.trim()
      && !!this.assetMetadata.qualityNote?.trim();
=======
    return !!this.assetMetadata.name?.trim()
      && !!this.assetMetadata.id?.trim()
      && !!this.assetMetadata.description?.trim()
      && this.assetMetadata.keywords.length > 0
      && !!this.assetMetadata.mediaType?.trim()
      && !!this.assetMetadata.qualityNote?.trim()
      && !!this.assetMetadata.ontologyType?.trim();
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  }

  isDatasourceValid(): boolean {
    switch (this.selectedStorageType) {
      case 'rest':
        return !!this.restConfig.method?.trim() && !!this.restConfig.url?.trim();
<<<<<<< HEAD

      case 'amazonS3':
        return !!this.s3Config.region?.trim() &&
          !!this.s3Config.bucket?.trim() &&
          !!this.s3Config.keyName?.trim() &&
          !!this.s3Config.accessKey?.trim() &&
          !!this.s3Config.secretKey?.trim();

      case 'azure':
        return !!this.azureConfig.account?.trim() &&
          !!this.azureConfig.keyName?.trim() &&
          !!this.azureConfig.container?.trim() &&
          !!this.azureConfig.blobName?.trim();

=======
      case 'amazonS3':
        return !!this.s3Config.region?.trim()
          && !!this.s3Config.bucket?.trim()
          && !!this.s3Config.keyName?.trim()
          && !!this.s3Config.accessKey?.trim()
          && !!this.s3Config.secretKey?.trim();
      case 'azure':
        return !!this.azureConfig.account?.trim()
          && !!this.azureConfig.sasToken?.trim()
          && !!this.azureConfig.container?.trim()
          && !!this.azureConfig.blobName?.trim();
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
      default:
        return false;
    }
  }

  toggleAuth(): void {
    this.restConfig.auth.visible = !this.restConfig.auth.visible;
  }

  togglePayload(): void {
    this.restConfig.payload = this.restConfig.payload ? null : { contentType: '', body: '' };
  }

  addHeader(): void {
    this.restConfig.additionalHeaders.push({ name: '', value: '' });
  }

  removeHeader(index: number): void {
    this.restConfig.additionalHeaders.splice(index, 1);
  }

<<<<<<< HEAD
  isFormValid(): boolean {
    if (!this.isGeneralValid()) return false;
    if (!this.isDatasourceValid()) return false;

    return this.selectedStorageType === 'rest' && this.isRestValid()
      || this.selectedStorageType === 'amazonS3' && this.isS3Valid()
      || this.selectedStorageType === 'azure' && this.isAzureValid();
  }

  isRestValid(): boolean {
    return !!this.restConfig.method && !!this.restConfig.url;
  }

  isS3Valid(): boolean {
    return !!this.s3Config.region && !!this.s3Config.bucket && !!this.s3Config.keyName && !!this.s3Config.accessKey && !!this.s3Config.secretKey;
  }

  isAzureValid(): boolean {
    return !!this.azureConfig.account && !!this.azureConfig.keyName && !!this.azureConfig.container && !!this.azureConfig.blobName;
=======
  get isFormValid(): boolean {
    return this.isGeneralValid() && this.isDatasourceValid();
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  }

  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

<<<<<<< HEAD
  // TODO
  //  -_ in the name is possible, also whitespaces, but whitespaces should be whenever theres a space, replace in ID with -

  clearDatasourceFields(): void {
    // Clear all types
=======
  clearDatasourceFields(): void {
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
    this.restConfig.method = '';
    this.restConfig.url = '';

    this.s3Config.region = '';
    this.s3Config.bucket = '';
    this.s3Config.keyName = '';
    this.s3Config.accessKey = '';
    this.s3Config.secretKey = '';

    this.azureConfig.account = '';
<<<<<<< HEAD
    this.azureConfig.keyName = '';
=======
    this.azureConfig.sasToken = '';
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
    this.azureConfig.container = '';
    this.azureConfig.blobName = '';
  }

  onSave(): void {
    let dataAddress: any = { type: this.selectedStorageType };

    if (this.selectedStorageType === 'rest') {
      dataAddress = {
<<<<<<< HEAD
=======
        "@type": "DataAddress",
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
        type: 'HttpData',
        method: this.restConfig.method,
        baseUrl: this.restConfig.url,
        authentication: this.restConfig.auth.visible
<<<<<<< HEAD
          ? {
=======
          ? JSON.stringify({
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
            type: this.restConfig.auth.type,
            headerName: this.restConfig.auth.headerName,
            ...(this.restConfig.auth.type === 'vault'
              ? { vaultSecretName: this.restConfig.auth.vaultSecretName }
              : { headerValue: this.restConfig.auth.headerValue })
<<<<<<< HEAD
          }
          : undefined,
        headers: this.restConfig.additionalHeaders.length ? this.restConfig.additionalHeaders : undefined,
        payload: this.restConfig.payload || undefined
=======
          })
          : undefined,
        headers: this.restConfig.additionalHeaders.length
          ? JSON.stringify(this.restConfig.additionalHeaders)
          : undefined,
        payload: this.restConfig.payload
          ? JSON.stringify(this.restConfig.payload)
          : undefined
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
      };
    }

    if (this.selectedStorageType === 'amazonS3') {
      dataAddress = {
<<<<<<< HEAD
=======
        "@type": "DataAddress",
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
        type: 'AmazonS3',
        region: this.s3Config.region,
        bucketName: this.s3Config.bucket,
        keyName: this.s3Config.keyName,
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey
      };
    }

    if (this.selectedStorageType === 'azure') {
      dataAddress = {
<<<<<<< HEAD
        type: 'AzureStorage',
        account: this.azureConfig.account,
        container: this.azureConfig.container,
        blobname: this.azureConfig.blobName,
        keyName: this.azureConfig.keyName
=======
        "@type": "DataAddress",
        type: 'AzureStorage',
        accountName: this.azureConfig.account,
        container: this.azureConfig.container,
        blobname: this.azureConfig.blobName,
        accountKey: this.azureConfig.sasToken
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
      };
    }

    const assetInput: AssetInput = {
      "@id": this.assetMetadata.id,
<<<<<<< HEAD
      properties: {
        name: this.assetMetadata.name,
        description: this.assetMetadata.description,
        ontologyType: this.assetMetadata.ontologyType,
        keyword: this.assetMetadata.keywords,
        mediaType: this.assetMetadata.mediaType,
        qualityNote: this.assetMetadata.qualityNote,
        language: this.assetMetadata.language,
=======
      "@context": CONTEXT_MAP,
      [`${NS.SEGITTUR}ecosystem`]: this.ecosystemService.ecosystem?.toLowerCase(),
      properties: {
        [`${NS.DCTERMS}title`]: this.assetMetadata.name,
        [`${NS.DCTERMS}description`]: this.assetMetadata.description,
        [`${NS.SEGITTURONT}concept`]: `segitturont:${this.assetMetadata.ontologyType}`,
        [`${NS.DCAT}keywords`]: this.assetMetadata.keywords?.join(', '),
        [`${NS.DCAT}mediaType`]: this.assetMetadata.mediaType,
        [`${NS.DQV}hasQualityAnnotation`]: this.assetMetadata.qualityNote,
        [`${NS.DCTERMS}language`]: this.assetMetadata.language,
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
      },
      dataAddress
    };

    this.dialogRef.close({ assetInput });
  }
<<<<<<< HEAD

=======
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
}
