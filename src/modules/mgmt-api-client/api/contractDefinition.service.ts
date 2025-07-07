import { Injectable } from '@angular/core';
import { HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import {
  ContractDefinitionInput,
  ContractDefinition,
  IdResponse,
  QuerySpec
} from "../model";
import { EdcConnectorProviderService } from "../../app/edc.connector.client.provider";

@Injectable({
  providedIn: 'root'
})
export class ContractDefinitionService {

  constructor(private connectorProvider: EdcConnectorProviderService) {}

  public createContractDefinition(
    input: ContractDefinitionInput,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<IdResponse>;
  public createContractDefinition(
    input: ContractDefinitionInput,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpResponse<IdResponse>>;
  public createContractDefinition(
    input: ContractDefinitionInput,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpEvent<IdResponse>>;
  public createContractDefinition(input: ContractDefinitionInput): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractDefinitions.create(input));
  }

  public deleteContractDefinition(
    id: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<any>;
  public deleteContractDefinition(
    id: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpResponse<any>>;
  public deleteContractDefinition(
    id: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpEvent<any>>;
  public deleteContractDefinition(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling deleteContractDefinition.');
    }

    const client = this.connectorProvider.getClient();
    return from(client.management.contractDefinitions.delete(id));
  }

  public getContractDefinition(
    id: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<ContractDefinition>;
  public getContractDefinition(
    id: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpResponse<ContractDefinition>>;
  public getContractDefinition(
    id: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpEvent<ContractDefinition>>;
  public getContractDefinition(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling getContractDefinition.');
    }

    const client = this.connectorProvider.getClient();
    return from(client.management.contractDefinitions.get(id));
  }

  public queryAllContractDefinitions(
    querySpec?: QuerySpec,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<Array<ContractDefinition>>;
  public queryAllContractDefinitions(
    querySpec?: QuerySpec,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpResponse<Array<ContractDefinition>>>;
  public queryAllContractDefinitions(
    querySpec?: QuerySpec,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json', context?: HttpContext }
  ): Observable<HttpEvent<Array<ContractDefinition>>>;
  public queryAllContractDefinitions(querySpec?: QuerySpec): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.contractDefinitions.queryAll(querySpec));
  }

}
