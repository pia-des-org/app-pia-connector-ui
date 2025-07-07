import { Injectable } from '@angular/core';
import { HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import {
  EdcConnectorClient,
  IdResponse,
  QuerySpec
} from '@think-it-labs/edc-connector-client';
import {
  ContractNegotiation,
  ContractNegotiationState,
  ContractNegotiationRequest
} from '../model';
import { EdcConnectorProviderService } from '../../app/edc.connector.client.provider';

@Injectable({
  providedIn: 'root'
})
export class ContractNegotiationService {

  constructor(private connectorProvider: EdcConnectorProviderService) {}

  public cancelNegotiation(id: string): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.terminate(id, "Cancelled by DataDashboard"));
  }

  public declineNegotiation(id: string): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.terminate(id, "Terminated by the DataDashboard"));
  }

  public getNegotiation(id: string): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.get(id));
  }

  public getNegotiationState(id: string): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.getState(id));
  }

  public initiateContractNegotiation(request: ContractNegotiationRequest): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.initiate(request));
  }

  public queryNegotiations(querySpec?: QuerySpec): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractNegotiations.queryAll(querySpec));
  }

}
