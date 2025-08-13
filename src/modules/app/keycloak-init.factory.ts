import { KeycloakService } from 'keycloak-angular';
import { AppConfigService } from './app-config.service';
import { EdcConnectorProviderService } from './edc.connector.client.provider';
import { CertificateService } from './components/services/certificate.service';

export function initializeApp(
  keycloak: KeycloakService,
  configService: AppConfigService,
  edcProvider: EdcConnectorProviderService,
  certificateService: CertificateService
): () => Promise<void> {
  return () =>
    configService.loadConfig()
      .then(() =>
        keycloak.init({
          config: {
            url: configService.getConfig()?.keycloakUrl!,
            realm: configService.getConfig()?.keycloakRealm!,
            clientId: configService.getConfig()?.keycloakClientId!
          },
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false
          }
        }))
      .then(() => edcProvider.init())
      .then(() => { return; });
}
