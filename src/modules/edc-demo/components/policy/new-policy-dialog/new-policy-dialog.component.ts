import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolicyDefinitionInput, PolicyInput } from '../../../../mgmt-api-client/model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { EcosystemService } from '../../../../app/components/services/ecosystem.service';


@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent {
  policyName: string = '';
  accessOption: 'bpn' | 'public' = 'bpn';
  businessPartnerNumbers: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  policyDefinition: PolicyDefinitionInput = {
    policy: {
      "@type": "set",
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      permission: []
    }
  };

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>,
              private ecosystemService: EcosystemService
  ) {}

  blockInvalidChars(event: KeyboardEvent): void {
    const allowed = /^[a-zA-Z0-9\-]$/;
    if (!allowed.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  addBpn(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
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
  }

  onSave(): void {
    if (!this.isGeneralValid()) return;

    const trimmedId = this.policyName.trim();
    const isRestricted = this.accessOption === 'bpn';

    // Build permission
    const permission: any = {
      action: "USE"
    };

    if (isRestricted) {
      if (this.ecosystemService.bpn.length > 0) {
        this.businessPartnerNumbers.push(this.ecosystemService.bpn);
      }
      permission.constraint = [
        {
          "odrl:or": this.businessPartnerNumbers.map(bpn => ({
            "@type": "Constraint",
            "odrl:leftOperand": "BusinessPartnerNumber",
            "odrl:operator": {"@id": "odrl:eq"},
            "odrl:rightOperand": bpn
          }))
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

    this.dialogRef.close(this.policyDefinition);
  }
}
