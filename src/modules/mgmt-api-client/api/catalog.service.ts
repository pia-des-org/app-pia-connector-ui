import { Injectable } from '@angular/core';
import {
  Catalog,
  CatalogRequest,
  Dataset,
  DatasetRequest,
} from '@think-it-labs/edc-connector-client';
import { HttpContext, HttpEvent, HttpResponse } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { EdcConnectorProviderService } from '../../app/edc.connector.client.provider';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private connectorProvider: EdcConnectorProviderService) {}

  public requestCatalog(catalogRequest: CatalogRequest): Observable<Catalog> {
    const client = this.connectorProvider.getClient();
    return from(client.management.catalog.request(catalogRequest));
  }

  public requestDataset(datasetRequest: DatasetRequest): Observable<Dataset> {
    const client = this.connectorProvider.getClient();
    return from(client.management.catalog.requestDataset(datasetRequest));
  }

}
