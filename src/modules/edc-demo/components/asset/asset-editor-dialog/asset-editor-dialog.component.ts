import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { AssetInput } from '@think-it-labs/edc-connector-client';
import { StorageType } from '../../../models/storage-type';
import { NS, CONTEXT_MAP } from '../../namespaces';
import {EcosystemService} from "../../../../app/components/services/ecosystem.service";
import {LanguageSelectItem} from "../language-select/language-select-item";
import {FormControl} from "@angular/forms";
import {LanguageSelectItemService} from "../language-select/language-select-item.service";
import {MarkdownPreviewDialogComponent} from "../markdown-preview-dialog/markdown-preview-dialog.component";

@Component({
  selector: 'edc-demo-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  assetMetadata = {
    name: '',
    id: '',
    description: '',
    ontologyType: 'Organization',
    keywords: [] as string[],
    mediaType: '',
    qualityNote: '',
    language: '',
    customProperties: [] as { name: string; value: string }[]
  };

  namespaces = Object.entries(CONTEXT_MAP).map(([prefix, iri]) => ({ prefix, iri }));

  selectedStorageType: string = 'rest';
  showPlaceholder = false;

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

  s3Config = {
    region: '',
    bucket: '',
    keyName: '',
    accessKey: '',
    secretKey: ''
  };

  azureConfig = {
    account: '',
    sasToken: '',
    container: '',
    blobName: ''
  };

  section = {
    general: true,
    datasource: false
  };

  languageControl = new FormControl<LanguageSelectItem | null>(null);

  constructor(
    private dialogRef: MatDialogRef<AssetEditorDialog>,
    private dialog: MatDialog,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private ecosystemService: EcosystemService,
    private languageService: LanguageSelectItemService
  ) {}

  ngOnInit(): void {
    if (this.assetMetadata.language) {
      this.languageControl.setValue(
        this.languageService.findById(this.assetMetadata.language)
      );
    }
  }

  openPreviewDialog(): void {
    this.dialog.open(MarkdownPreviewDialogComponent, {
      data: {
        markdownText: this.assetMetadata.description
      },
      width: '600px',
      maxHeight: '80vh'
    });
  }

  onNameChange(value: string): void {
    this.assetMetadata.name = value;
    this.assetMetadata.id = this.slugify(value);
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^\w\-]+/g, '')       // Remove non-word characters
      .replace(/__+/g, '_')           // Collapse multiple underscores
      .replace(/^_+|_+$/g, '');       // Trim underscores from start/end
  }

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
    if (target === 'datasource' && !this.isGeneralValid()) return;

    this.section.general = false;
    this.section.datasource = false;
    this.section[target] = true;
  }

  isGeneralValid(): boolean {
    return !!this.assetMetadata.name?.trim()
      && !!this.assetMetadata.id?.trim()
      && !!this.assetMetadata.description?.trim()
      && this.assetMetadata.keywords.length > 0
      && !!this.assetMetadata.ontologyType?.trim();
  }

  isDatasourceValid(): boolean {
    switch (this.selectedStorageType) {
      case 'rest':
        return !!this.restConfig.method?.trim() && !!this.restConfig.url?.trim();
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

  addCustomProperty(): void {
    this.assetMetadata.customProperties.push({ name: '', value: '' });
  }

  removeCustomProperty(index: number): void {
    this.assetMetadata.customProperties.splice(index, 1);
  }

  get isFormValid(): boolean {
    return this.isGeneralValid() && this.isDatasourceValid();
  }

  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  clearDatasourceFields(): void {
    this.restConfig.method = '';
    this.restConfig.url = '';

    this.s3Config.region = '';
    this.s3Config.bucket = '';
    this.s3Config.keyName = '';
    this.s3Config.accessKey = '';
    this.s3Config.secretKey = '';

    this.azureConfig.account = '';
    this.azureConfig.sasToken = '';
    this.azureConfig.container = '';
    this.azureConfig.blobName = '';
  }

  onSave(): void {
    let dataAddress: any = { type: this.selectedStorageType };

    if (this.selectedStorageType === 'rest') {
      dataAddress = {
        "@type": "DataAddress",
        type: 'HttpData',
        method: this.restConfig.method,
        baseUrl: this.restConfig.url,
        authentication: this.restConfig.auth.visible
          ? JSON.stringify({
            type: this.restConfig.auth.type,
            headerName: this.restConfig.auth.headerName,
            ...(this.restConfig.auth.type === 'vault'
              ? { vaultSecretName: this.restConfig.auth.vaultSecretName }
              : { headerValue: this.restConfig.auth.headerValue })
          })
          : undefined,
        headers: this.restConfig.additionalHeaders.length
          ? JSON.stringify(this.restConfig.additionalHeaders)
          : undefined,
        payload: this.restConfig.payload
          ? JSON.stringify(this.restConfig.payload)
          : undefined
      };
    }

    if (this.selectedStorageType === 'amazonS3') {
      dataAddress = {
        "@type": "DataAddress",
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
        "@type": "DataAddress",
        type: 'AzureStorage',
        account: this.azureConfig.account,
        container: this.azureConfig.container,
        blobname: this.azureConfig.blobName,
        sasToken: this.azureConfig.sasToken
      };
    }

    const properties: any = {
      [`${NS.DCTERMS}title`]: this.assetMetadata.name,
      [`${NS.DCTERMS}description`]: this.assetMetadata.description,
      [`${NS.SEGITTURONT}concept`]: `segitturont:${this.assetMetadata.ontologyType}`,
      [`${NS.DCAT}keyword`]: this.assetMetadata.keywords,
      ...Object.fromEntries(
        this.assetMetadata.customProperties
          .filter(p => p.name && p.value)
          .map(p => [p.name, p.value])
      )
    };

    if (this.assetMetadata.mediaType?.trim()) {
      properties[`${NS.DCAT}mediaType`] = this.assetMetadata.mediaType;
    }

    if (this.assetMetadata.qualityNote?.trim()) {
      properties[`${NS.DQV}hasQualityAnnotation`] = {
        [`${NS.RDFS}comment`]: this.assetMetadata.qualityNote
      };
    }

    if (this.languageControl.value?.id?.trim()) {
      properties[`${NS.DCTERMS}language`] = this.languageControl.value.id;
    }

    const assetInput: AssetInput = {
      "@id": this.assetMetadata.id,
      "@context": CONTEXT_MAP,
      [`${NS.SEGITTUR}ecosystem`]: this.ecosystemService.ecosystem?.toLowerCase(),
      properties,
      dataAddress
    };

    this.dialogRef.close({ assetInput });
  }
}
//        [`${NS.DQV}hasQualityAnnotation`]: {
//           "@type": 'dqv:QualityAnnotation',
//           [`${NS.RDFS}comment`]: this.assetMetadata.qualityNote
//         },
