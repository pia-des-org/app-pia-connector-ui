import {Component, Inject, OnInit} from '@angular/core';
import {
  AssetService,
  ContractAgreementService,
  ContractNegotiationService,
  TransferProcessService
} from "../../../mgmt-api-client";
import {from, Observable, of} from "rxjs";
import {ContractAgreement, IdResponse} from "../../../mgmt-api-client/model";
import {catchError, filter, first, map, retry, switchMap, tap} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";
import {
  CatalogBrowserTransferDialog
} from "../catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CatalogBrowserService} from "../../services/catalog-browser.service";
import {Router} from "@angular/router";
import {TransferProcessStates} from "../../models/transfer-process-states";
import {NegotiateTransferComponent} from "../negotiate-transfer/negotiate-transfer.component";
import {ContractNegotiation} from "@think-it-labs/edc-connector-client"
import {TransferRequest} from "./transferRequest";
import { AppConfigService } from '../../../app/app-config.service';
import { CONNECTOR_RECEIVER_API } from 'src/modules/app/variables';
import { HttpClient } from '@angular/common/http';

interface RunningTransferProcess {
  processId: string;
  contractId: string;
  state: TransferProcessStates;
}

interface PullTransferMetadata {
  id: string,
  endpoint: string,
  authKey: string,
  authCode: string,
}

/**
 * Displays a list of finalized contract agreements and enables users to initiate data transfers.
 */
@Component({
  selector: 'app-contract-viewer',
  templateUrl: './contract-viewer.component.html',
  styleUrls: ['./contract-viewer.component.scss']
})
export class ContractViewerComponent implements OnInit {

  contracts$: Observable<ContractAgreement[]> = of([]);
  private runningTransfers: RunningTransferProcess[] = [];
  private pollingHandleTransfer?: any;
  private contractNegotiationData?: ContractNegotiation[]
  private pollingStartTime?: number;

  constructor(private contractAgreementService: ContractAgreementService,
              private assetService: AssetService,
              public dialog: MatDialog,
              @Inject('HOME_CONNECTOR_STORAGE_ACCOUNT') private homeConnectorStorageAccount: string,
              @Inject(CONNECTOR_RECEIVER_API) private receiverUrl: string,
              private transferService: TransferProcessService,
              private catalogService: CatalogBrowserService,
              private router: Router,
              private notificationService: NotificationService,
              private contractNegotiationService : ContractNegotiationService,
              private appConfig: AppConfigService,
              private httpClient: HttpClient) {
  }

  /**
   * Returns true if a given transfer state indicates completion (or failure).
   */
  private static isFinishedState(state: string): boolean {
    return [
      "COMPLETED",
      "ERROR",
      "ENDED"].includes(state);
  }

  /**
   * Fetches and stores only finalized contract negotiations for later use (e.g. to resolve connector address).
   */
  async getConnectorAddressData() {
    await this.contractNegotiationService.queryNegotiations()
      .forEach((response: ContractNegotiation[]) => {
        this.contractNegotiationData = response.filter((item) => {
          return item['https://w3id.org/edc/v0.0.1/ns/state'][0]['@value'] === 'FINALIZED'
        })
      })
  }

  /**
   * Loads finalized negotiations, then initializes contracts.
   * If queryParams include providerUrl and assetId, opens transfer dialog automatically.
   */
  async ngOnInit(): Promise<void> {
    await this.getConnectorAddressData();
    this.refreshContracts();

    this.router.routerState.root.queryParams
      .pipe(first())
      .subscribe(params => {
        const providerUrl = params['providerUrl'];
        const assetId = params['assetId'];

        if (providerUrl && assetId) {
          this.dialog.open(NegotiateTransferComponent, {
            data: { providerUrl, assetId }
          }).afterClosed().pipe(first()).subscribe(result => {
            if (result?.refreshList) {
              this.refreshContracts();
            }
          });
        }
      });
  }

  /**
   * Loads all contract agreements and enriches them with connector addresses from finalized negotiations.
   * Filters out contracts without matching finalized negotiation.
   */
  refreshContracts(): void {
    this.contractAgreementService.queryAllAgreements().pipe(
      map((allContracts: ContractAgreement[]) => {
        const negotiationData = this.contractNegotiationData || [];

        return allContracts.reduce((result: ContractAgreement[], contract) => {
          const matchingNegotiation = negotiationData.find(n =>
            n['https://w3id.org/edc/v0.0.1/ns/contractAgreementId']?.[0]?.['@value'] === contract['@id']
          );

          if (matchingNegotiation) {
            (contract as any)['connectorAddress'] =
              matchingNegotiation['https://w3id.org/edc/v0.0.1/ns/counterPartyAddress']?.[0]?.['@value'] || '';
            result.push(contract);
          }

          return result;
        }, []);
      }),
      catchError(err => {
        console.error('Failed fetching contracts:', err);
        return of([]);
      })
    ).subscribe(filteredContracts => {
      this.contracts$ = of(filteredContracts);
    });
  }

  /**
   * Converts an epoch timestamp (in seconds) to a localized date string.
   */
  asDate(epochSeconds?: number): string {
    if(epochSeconds){
      const d = new Date(0);
      d.setUTCSeconds(epochSeconds);
      return d.toLocaleDateString();
    }
    return '';
  }

  /**
   * Opens transfer dialog and, upon confirmation, sends transfer request.
   * Starts polling the process until completed.
   */
  onTransferClicked(contract: ContractAgreement) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog);

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      const dataDestination: any = result.dataDestination;

      const request = this.createTransferRequest(contract, dataDestination);

      this.transferService.initiateTransfer(request).subscribe({
        next: (transferId) => {
          if (dataDestination.type === "HttpProxy") {
            this.downloadPullTransfer(transferId);
            return;
          }
          
          this.startPolling(transferId, contract['@id']!);
        },
        error: (error) => {
          console.error(error);
          this.notificationService.showError("Error initiating transfer");
        }
      });
    });
  }

  /**
   * Checks whether the given contract is currently being transferred.
   */
  isTransferInProgress(contractId: string): boolean {
    return !!this.runningTransfers.find(rt => rt.contractId === contractId);
  }

  /**
   * Returns polling timeout in ms from config, defaulting to 60 seconds.
   */
  private get POLLING_TIMEOUT_MS(): number {
    const config = this.appConfig.getConfig();
    return config?.transferPollingTimeoutMs || 60000;
  }

  /**
   * Builds a transfer request object from contract and selected destination.
   */
  private createTransferRequest(contract: ContractAgreement, dataDestination: any): TransferRequest {
    return {
      '@context': {
        odrl: "http://www.w3.org/ns/odrl/2/"
      },
      assetId: contract.assetId,
      contractId: contract.id,
      dataDestination: dataDestination,
      connectorAddress: (contract as any).connectorAddress,
      connectorId: contract.providerId,
      managedResources: false,
      protocol: "dataspace-protocol-http",
      privateProperties: {
        receiverHttpEndpoint: this.receiverUrl
      },
      transferType: {
        contentType: "application/octet-stream",
        isFinite: true
      }
    };
  }

  /**
   * Starts polling the transfer status until it finishes or times out.
   * Navigates to transfer history on success.
   */
  private startPolling(transferProcessId: IdResponse, contractId: string) {
    // track this transfer process
    this.runningTransfers.push({
      processId: transferProcessId.id!,
      state: TransferProcessStates.REQUESTED,
      contractId: contractId
    });

    if (!this.pollingHandleTransfer) {
      this.pollingStartTime = Date.now();
      this.pollingHandleTransfer = setInterval(this.pollRunningTransfers(), 1000);
    }

  }

  /**
   * Polls transfer processes to check for completion or errors.
   * If completed, clears polling and notifies the user.
   */
  private pollRunningTransfers() {
    return () => {
      const now = Date.now();

      if (this.pollingStartTime && now - this.pollingStartTime > this.POLLING_TIMEOUT_MS) {
        clearInterval(this.pollingHandleTransfer);
        this.pollingHandleTransfer = undefined;
        this.runningTransfers = [];
        this.notificationService.showError("Transfer polling timed out.");
        return;
      }

      from(this.runningTransfers) //create from array
        .pipe(switchMap(runningTransferProcess => this.catalogService.getTransferProcessesById(runningTransferProcess.processId)), // fetch from API
          filter(transferprocess => ContractViewerComponent.isFinishedState(transferprocess.state!)), // only use finished ones
          tap(transferProcess => {
            // remove from in-progress
            this.runningTransfers = this.runningTransfers.filter(rtp => rtp.processId !== transferProcess.id)
            this.notificationService.showInfo(`Transfer [${transferProcess.id}] complete!`, "Show me!", () => {
              this.router.navigate(['/transfer-history'])
            })
          }),
        ).subscribe(() => {
        // clear interval if necessary
        if (this.runningTransfers.length === 0) {
          clearInterval(this.pollingHandleTransfer);
          this.pollingHandleTransfer = undefined;
        }
      }, error => this.notificationService.showError(error))
    }

  }

  /**
   * Assembles the client-side request of a pull transfer
   * and downloads the data for the user to then save locally
   */
  private downloadPullTransfer(transferId: IdResponse) {
    const id = transferId.id;
    const url = this.receiverUrl + "/" + id

    this.httpClient.get<PullTransferMetadata>(url).pipe(
      retry({count: 10, delay: 1000}),
      switchMap(meta => this.httpClient.get(meta.endpoint, {headers: {[meta.authKey]: meta.authCode}, responseType: "blob"}))
    ).subscribe(blob => {
      const objectUrl = URL.createObjectURL(blob)
      
      const link: HTMLAnchorElement = document.createElement("a")
      link.href = objectUrl;
      link.download = "data";
      link.click();

      URL.revokeObjectURL(objectUrl)
    })
  }
}
