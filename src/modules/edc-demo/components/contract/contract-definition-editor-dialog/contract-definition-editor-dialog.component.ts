import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  AssetService, PolicyService
} from "../../../../mgmt-api-client";
import { Asset, ContractDefinitionInput, PolicyDefinition } from "../../../../mgmt-api-client/model"

/**
 * Dialog component for creating or editing a contract definition.
 *
 * Allows users to select an access policy, contract policy, and assets.
 * On submission, the component constructs a ContractDefinitionInput object
 * and returns it to the caller.
 */
@Component({
  selector: 'edc-demo-contract-definition-editor-dialog',
  templateUrl: './contract-definition-editor-dialog.component.html',
  styleUrls: ['./contract-definition-editor-dialog.component.scss']
})
export class ContractDefinitionEditorDialog implements OnInit {
  policies: Array<PolicyDefinition> = [];
  availableAssets: Asset[] = [];
  accessPolicy?: PolicyDefinition;
  contractPolicy?: PolicyDefinition;
  assets: Asset | Asset[] = [];

  contractDefinition: ContractDefinitionInput = {
    "@id": '',
    assetsSelector: [],
    accessPolicyId: undefined!,
    contractPolicyId: undefined!
  };

  constructor(private policyService: PolicyService,
              private assetService: AssetService,
              private dialogRef: MatDialogRef<ContractDefinitionEditorDialog>,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: ContractDefinitionInput) {
    if (contractDefinition) {
      this.contractDefinition = contractDefinition;
    }
  }

  /**
   * Initializes the component by loading all policies and assets,
   * and preselecting any provided values from the injected data.
   */
  ngOnInit(): void {
    this.policyService.queryAllPolicies().subscribe(policyDefinitions => {
      this.policies = policyDefinitions;
      this.accessPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.accessPolicyId);
      this.contractPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.contractPolicyId);
    });
    this.assetService.requestAssets().subscribe(assets => {
      this.availableAssets = assets;
      // preselection
      if (this.contractDefinition) {
        const assetIds = this.contractDefinition.assetsSelector.map(c => c.operandRight?.toString());
        this.assets = this.availableAssets.filter(asset => assetIds.includes(asset.id));
      }
    })
  }

  /**
   * Prevents the user from entering invalid characters in the contract ID input.
   * Only alphanumeric characters and dashes are allowed.
   *
   * @param event Keyboard event from input
   */
  blockInvalidChars(event: KeyboardEvent): void {
    const allowed = /^[a-zA-Z0-9\-]$/;
    if (!allowed.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Indicates whether the form is valid for submission.
   * All required fields must be filled: ID, access policy, contract policy, and at least one asset.
   */
  get isFormValid(): boolean {
    const hasAsset = Array.isArray(this.assets)
      ? this.assets.length > 0
      : !!this.assets;

    return !!this.contractDefinition['@id']?.trim()
      && !!this.accessPolicy
      && !!this.contractPolicy
      && hasAsset;
  }

  /**
   * Constructs and returns the finalized contract definition based on user input.
   * Closes the dialog and passes the data to the calling component.
   */
  onSave(): void {
    const selectedAsset = Array.isArray(this.assets) ? this.assets[0] : this.assets;

    const contractDefinition = {
      "@id": this.contractDefinition["@id"]?.trim(),
      "@context": {},
      "@type": "ContractDefinition",
      accessPolicyId: this.accessPolicy!['@id'],
      contractPolicyId: this.contractPolicy!['@id'],
      assetsSelector: [
        {
          "@type": "CriterionDto",
          operandLeft: "https://w3id.org/edc/v0.0.1/ns/id",
          operator: "=",
          operandRight: selectedAsset.id,
        },
      ],
    };

    this.dialogRef.close({
      contractDefinition
    });
  }
}
