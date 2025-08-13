import {Component, OnInit} from '@angular/core';
import {PolicyService} from "../../../../mgmt-api-client";
import {BehaviorSubject, Observable, Observer, of} from "rxjs";
import {first, map, switchMap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {NewPolicyDialogComponent} from "../new-policy-dialog/new-policy-dialog.component";
import {NotificationService} from "../../../services/notification.service";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../confirmation-dialog/confirmation-dialog.component";
import {PolicyDefinition, PolicyDefinitionInput, IdResponse, Asset} from "../../../../mgmt-api-client/model";
import {PolicyDetailsDialogComponent} from "../policy-details-dialog/policy-details-dialog.component";

/**
 * Component responsible for displaying, creating, and deleting policy definitions.
 */
@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {

  filteredPolicies$: Observable<PolicyDefinition[]> = of([]);
  searchText: string = '';
  private fetch$ = new BehaviorSubject(null);
  private readonly errorOrUpdateSubscriber: Observer<IdResponse>;

  constructor(private policyService: PolicyService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog) {

    this.errorOrUpdateSubscriber = {
      next: x => this.fetch$.next(null),
      error: err => this.showError(err, "An error occurred."),
      complete: () => {
        this.notificationService.showInfo("Successfully completed")
      },
    }

  }

  /** Initialize observable that loads and optionally filters all policies */
  ngOnInit(): void {
    this.filteredPolicies$ = this.fetch$.pipe(
      switchMap(() => {
        const policyDefinitions = this.policyService.queryAllPolicies();
        return !!this.searchText ?
          policyDefinitions.pipe(map(policies => policies.filter(policy => this.isFiltered(policy, this.searchText))))
          :
          policyDefinitions;
      }));
  }

  /**
   * Opens the policy details dialog and optionally deletes the policy if requested.
   * @param policy The selected policy to view (and optionally delete)
   */
  openPolicyDialog(policy: PolicyDefinition): void {
    const mergedPolicy = {
      '@id': policy['@id'],
      "@context": policy['@context'],
      'edc:createdAt': policy.createdAt,
      ...policy['edc:policy']
    };

    this.dialog.open(PolicyDetailsDialogComponent, {
      data: { policy: mergedPolicy }
    }).afterClosed().subscribe(result => {
      if (result?.delete) {
        this.delete(policy);
      }
    });
  }

  /** Triggers a re-fetch based on the current search input */
  onSearch() {
    this.fetch$.next(null);
  }

  /** Opens the new policy creation dialog, then saves the result */
  onCreate() {
    const dialogRef = this.dialog.open(NewPolicyDialogComponent);
    dialogRef.afterClosed().pipe(first()).subscribe({
      next: (newPolicyDefinition: PolicyDefinitionInput) => {
        if (newPolicyDefinition) {
          this.policyService.createPolicy(newPolicyDefinition).subscribe({
            next: (response: IdResponse) => {
              this.errorOrUpdateSubscriber.next(response);
              this.notificationService.showInfo("Successfully created");
            },
              error: (error: Error) => this.showError(error, "An error occurred while creating the policy.")
            }
          );
        }
      }
    });
  }

  /**
   * Simple JSON-based full-text filter function for policies.
   * @param policy The policy object to check
   * @param searchText The lowercase filter string
   */
  private isFiltered(policy: PolicyDefinition, searchText: string) {
    return JSON.stringify(policy).includes(searchText);
  }

  /**
   * Opens a confirmation dialog, then deletes the selected policy if confirmed.
   * @param policy The policy to delete
   */
  delete(policy: PolicyDefinition) {

    let policyId = policy['@id']!;
    const dialogData = ConfirmDialogModel.forDelete("policy", policyId);

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      data: dialogData
    });

    ref.afterClosed().subscribe({

      next: (res: any) => {
        if (res) {
          this.policyService.deletePolicy(policyId).subscribe(
            {
              next: (response: IdResponse) => this.errorOrUpdateSubscriber.next(response),
              error: (error: Error) => this.showError(error, "An error occurred while deleting the policy.")
            }
          );
        }
      }
    });
  }

  /**
   * Opens a confirmation dialog, then deletes the selected policy if confirmed.
   * @param policy The policy to delete
   */
  getBpnConstraint(policy: PolicyDefinition): string | null {
    const edcPolicy = policy['edc:policy'];
    if (!edcPolicy) return null;

    const permission = edcPolicy['odrl:permission'];
    if (!permission) return null;
    const constraint = permission['odrl:constraint'];
    if (!constraint) return null;
    const orConstraints = constraint['odrl:or'];
    if (!orConstraints) return null;

    const normalizedOrConstraints = Array.isArray(orConstraints) ? orConstraints : [orConstraints];

    const bpns: string[] = normalizedOrConstraints
      .filter((c: any) => c['odrl:leftOperand']?.includes('BusinessPartnerNumber'))
      .map((c: any) => c['odrl:rightOperand'])
      .filter((bpn: any) => typeof bpn === 'string');

    return bpns.length > 0 ? `BPN: ${bpns.join(', ')}` : null;
  }

  /** Displays a formatted error message using the NotificationService */
  private showError(error: Error, errorMessage: string) {
    console.error(error);
    this.notificationService.showError(errorMessage);
  }
}
