import {Injectable} from "@angular/core";
import {
  Catalog,
  CatalogRequest, Dataset, DatasetRequest,
} from "@think-it-labs/edc-connector-client";
import {HttpContext, HttpEvent, HttpResponse} from "@angular/common/http";
import {from, Observable} from "rxjs";
import {EdcConnectorProviderService} from "../../app/edc.connector.client.provider";

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private catalog;

  constructor(private connectorProvider: EdcConnectorProviderService) {
    const client = this.connectorProvider.getClient();
    this.catalog = client.management.catalog;
  }

  public requestCatalog(catalogRequest: CatalogRequest): Observable<Catalog> {
    return from(this.catalog.request(catalogRequest))
  }

  public requestDataset(datasetRequest: DatasetRequest): Observable<Dataset> {
    return from(this.catalog.requestDataset(datasetRequest));
  }

}
