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

/**
 * Dialog component for creating a new asset.
 * Supports REST, Amazon S3, and Azure Blob Storage as data sources.
 */
@Component({
  selector: 'edc-demo-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  assetMetadata = {
    name: '',
    id: '',
    description: '',
    ontologyType: 'Organization',
    keywords: [] as string[],
    mediaType: '',
    qualityNote: '',
    language: '',
    geographicalLocation: '',
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

  /** Opens a dialog to preview the asset's Markdown description. */
  openPreviewDialog(): void {
    this.dialog.open(MarkdownPreviewDialogComponent, {
      data: {
        markdownText: this.assetMetadata.description
      },
      width: '600px',
      maxHeight: '80vh'
    });
  }

  /**
   * Updates asset name and ID based on user input.
   * @param value Name string entered by the user
   */
  onNameChange(value: string): void {
    this.assetMetadata.name = value;
    this.assetMetadata.id = this.slugify(value);
  }

  /**
   * Prevents invalid characters from being typed in the name field.
   * Allows only alphanumeric characters, spaces, and hyphens.
   */
  blockInvalidChars(event: KeyboardEvent): void {
    const allowed = /^[a-zA-Z0-9 \-]$/;
    if (!allowed.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  /** Converts input value into a slugified asset ID. */
  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^\w\-]+/g, '')       // Remove non-word characters
      .replace(/__+/g, '_')           // Collapse multiple underscores
      .replace(/^_+|_+$/g, '');       // Trim underscores from start/end
  }

  /** Adds a keyword to the asset's metadata from a chip input. */
  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.assetMetadata.keywords.push(value);
    }
    event.chipInput?.clear();
  }

  /**
   * Removes a keyword from the metadata list.
   * @param keyword The keyword to remove
   */
  removeKeyword(keyword: string): void {
    const index = this.assetMetadata.keywords.indexOf(keyword);
    if (index >= 0) {
      this.assetMetadata.keywords.splice(index, 1);
    }
  }

  /**
   * Switches between form sections: general and datasource.
   * Prevents navigating to datasource if general section is invalid.
   */
  toggleSection(target: 'general' | 'datasource'): void {
    if (this.section[target]) return;
    if (target === 'datasource' && !this.isGeneralValid()) return;

    this.section.general = false;
    this.section.datasource = false;
    this.section[target] = true;
  }

  /** Checks if the general metadata section is valid. */
  isGeneralValid(): boolean {
    return !!this.assetMetadata.name?.trim()
      && !!this.assetMetadata.id?.trim()
      && !!this.assetMetadata.description?.trim()
      && this.assetMetadata.keywords.length > 0
      && !!this.assetMetadata.ontologyType?.trim();
  }

  /** Validates the currently selected datasource configuration. */
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

  /** Toggles visibility of authentication fields in REST config. */
  toggleAuth(): void {
    this.restConfig.auth.visible = !this.restConfig.auth.visible;
  }

  /** Toggles visibility of the REST payload section. */
  togglePayload(): void {
    this.restConfig.payload = this.restConfig.payload ? null : { contentType: '', body: '' };
  }

  /** Adds an empty HTTP header field to the REST config. */
  addHeader(): void {
    this.restConfig.additionalHeaders.push({ name: '', value: '' });
  }

  /**
   * Removes a specific header field by index.
   * @param index Index of the header to remove
   */
  removeHeader(index: number): void {
    this.restConfig.additionalHeaders.splice(index, 1);
  }

  /** Adds an empty custom property to the asset metadata. */
  addCustomProperty(): void {
    this.assetMetadata.customProperties.push({ name: '', value: '' });
  }

  /**
   * Removes a custom property by index.
   * @param index Index of the property to remove
   */
  removeCustomProperty(index: number): void {
    this.assetMetadata.customProperties.splice(index, 1);
  }

  /** Returns whether both form sections are valid. */
  get isFormValid(): boolean {
    return this.isGeneralValid() && this.isDatasourceValid();
  }

  /** Resets storage-specific fields when storage type changes. */
  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  /** Clears all datasource fields across all types. */
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

  /** Prepares and submits the asset data, then closes the dialog. */
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

    if (this.assetMetadata.geographicalLocation?.trim()) {
      properties[`${NS.DCTERMS}spatial`] = {
        [`${NS.LOCN}geometry`]: [
          {
            "@type": `${CONTEXT_MAP.geosparql}wktLiteral`,
            "@value": this.assetMetadata.geographicalLocation.trim()
          }
        ]
      };
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

