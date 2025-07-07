import { Injectable } from '@angular/core';
import { HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import {
  TransferProcessState,
  TransferProcess,
  TransferProcessInput,
  QuerySpec,
  IdResponse
} from '../model';
import { TransferRequest } from '../../edc-demo/components/contract-viewer/transferRequest';
import { EdcConnectorProviderService } from '../../app/edc.connector.client.provider';

@Injectable({
  providedIn: 'root'
})
export class TransferProcessService {
  constructor(private connectorProvider: EdcConnectorProviderService) {}

  private getClient() {
    return this.connectorProvider.getClient().management.transferProcesses;
  }

  public cancelTransferProcess(id: string): Observable<any> {
    return from(this.getClient().terminate(id, 'Call by DataDashboard.'));
  }

  public deprovisionTransferProcess(id: string): Observable<any> {
    return from(this.getClient().deprovision(id));
  }

  public getTransferProcess(id: string): Observable<any> {
    return from(this.getClient().get(id));
  }

  public getTransferProcessState(id: string): Observable<any> {
    return from(this.getClient().getState(id));
  }

  public initiateTransfer(transferRequestInput: TransferRequest): Observable<any> {
    return from(this.getClient().initiate(transferRequestInput));
  }

  public queryAllTransferProcesses(querySpec?: QuerySpec): Observable<any> {
    return from(this.getClient().queryAll(querySpec));
  }
}
