import { Injectable } from '@angular/core';
import { EdcConnectorClient } from '@think-it-labs/edc-connector-client';
import { KeycloakService } from 'keycloak-angular';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class EdcConnectorProviderService {
  private client!: EdcConnectorClient;

  constructor(
    private keycloak: KeycloakService,
    private configService: AppConfigService
  ) {}

  async init(): Promise<void> {
    console.log("Auth initiated");
    const token = await this.keycloak.getToken();
    const config = this.configService.getConfig();

    this.client = new EdcConnectorClient.Builder()
      .apiToken(token)
      .managementUrl(config?.managementApiUrl as string)
      .build();
  }

  getClient(): EdcConnectorClient {
    if (!this.client) {
      throw new Error('EdcConnectorClient not initialized. Call init() first.');
    }
    return this.client;
  }
}


