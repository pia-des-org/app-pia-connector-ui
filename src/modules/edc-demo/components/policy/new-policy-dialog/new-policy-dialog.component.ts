import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolicyDefinitionInput, PolicyInput } from '../../../../mgmt-api-client/model';
<<<<<<< HEAD
=======
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent {
  policyName: string = '';
  accessOption: 'bpn' | 'public' = 'bpn';
<<<<<<< HEAD
  businessPartnerNumber: string = '';

  policy: PolicyInput = {
    "@type": "set"
  };
  policyDefinition: PolicyDefinitionInput = {
    "policy": this.policy,
    "@id": ''
=======
  businessPartnerNumbers: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  policyDefinition: PolicyDefinitionInput = {
    policy: {
      "@type": "set",
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      permission: []
    }
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  };

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>) {}

<<<<<<< HEAD
  isGeneralValid(): boolean {
    if (!this.policyName.trim()) return false;
    return !(this.accessOption === 'bpn' && !this.businessPartnerNumber.trim());
=======
  addBpn(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.businessPartnerNumbers.includes(value)) {
      this.businessPartnerNumbers.push(value);
    }
    event.chipInput?.clear();
  }

  removeBpn(bpn: string): void {
    const index = this.businessPartnerNumbers.indexOf(bpn);
    if (index >= 0) {
      this.businessPartnerNumbers.splice(index, 1);
    }
  }

  isGeneralValid(): boolean {
    if (!this.policyName.trim()) return false;
    return !(this.accessOption === 'bpn' && this.businessPartnerNumbers.length === 0);
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43
  }

  onSave(): void {
    if (!this.isGeneralValid()) return;

<<<<<<< HEAD
    // Assign ID and fields
    this.policyDefinition['@id'] = this.policyName;
    this.policyDefinition.policy.assigner = this.accessOption === 'bpn' ? this.businessPartnerNumber.trim() : 'PUBLIC';

    this.policy["@context"]="http://www.w3.org/ns/odrl.jsonld"
=======
    const trimmedId = this.policyName.trim();
    const isRestricted = this.accessOption === 'bpn';

    // Build permission
    const permission: any = {
      action: "USE"
    };

    if (isRestricted) {
      permission.constraint = [
        {
          "@type": "Constraint",
          leftOperand: "BusinessPartnerNumber",
          operator: {
            "@id": this.businessPartnerNumbers.length > 1
              ? "odrl:in"
              : "odrl:eq"
          },
          rightOperand: this.businessPartnerNumbers.length > 1
            ? this.businessPartnerNumbers
            : this.businessPartnerNumbers[0]
        }
      ];
    }

    // Build the final policy definition input
    this.policyDefinition = {
      "@id": trimmedId,
      id: trimmedId,
      policy: {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "set",
        permission: [permission]
      }
    };
>>>>>>> bf94d2d90e492eb87deaa5cd7cd5d00e5f789a43

    this.dialogRef.close(this.policyDefinition);
  }
}
