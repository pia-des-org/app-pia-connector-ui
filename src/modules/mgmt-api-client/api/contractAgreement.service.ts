import { Injectable } from '@angular/core';
import { HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable, from } from 'rxjs';

import { ContractAgreement, QuerySpec } from '../model';
import { EdcConnectorProviderService } from '../../app/edc.connector.client.provider';

@Injectable({
  providedIn: 'root'
})
export class ContractAgreementService {

  constructor(private connectorProvider: EdcConnectorProviderService) {}

  /**
   * Gets all contract agreements according to a particular query
   * @param querySpec
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public queryAllAgreements(
    querySpec?: QuerySpec,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<Array<ContractAgreement>>;
  public queryAllAgreements(
    querySpec?: QuerySpec,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpResponse<Array<ContractAgreement>>>;
  public queryAllAgreements(
    querySpec?: QuerySpec,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpEvent<Array<ContractAgreement>>>;
  public queryAllAgreements(querySpec?: QuerySpec): Observable<any> {
    // Always get the freshest client with the latest token
    const client = this.connectorProvider.getClient();
    const contractAgreements = client.management.contractAgreements;
    return from(contractAgreements.queryAll(querySpec));
  }
}
