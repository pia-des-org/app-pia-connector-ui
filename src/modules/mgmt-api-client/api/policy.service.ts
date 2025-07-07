import { Injectable } from '@angular/core';
import { HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import {
  PolicyDefinition,
  PolicyDefinitionInput,
  IdResponse,
  QuerySpec
} from '../model';
import { EdcConnectorProviderService } from '../../app/edc.connector.client.provider';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private connectorProvider: EdcConnectorProviderService) {}

  public createPolicy(input: PolicyDefinitionInput): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.policyDefinitions.create(input));
  }

  public deletePolicy(id: string): Observable<any> {
    if (!id) {
      throw new Error('Required parameter id was null or undefined when calling deletePolicy.');
    }
    const client = this.connectorProvider.getClient();
    return from(client.management.policyDefinitions.delete(id));
  }

  public getPolicy(id: string): Observable<any> {
    if (!id) {
      throw new Error('Required parameter id was null or undefined when calling getPolicy.');
    }
    const client = this.connectorProvider.getClient();
    return from(client.management.policyDefinitions.get(id));
  }

  public queryAllPolicies(querySpec?: QuerySpec): Observable<any> {
    const client = this.connectorProvider.getClient();
    return from(client.management.policyDefinitions.queryAll(querySpec));
  }
}
