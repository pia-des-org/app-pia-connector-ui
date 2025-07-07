// import { KeycloakService } from 'keycloak-angular';
// import { AppConfigService } from './app-config.service';
// import { EdcConnectorProviderService } from './edc.connector.client.provider';

// export function initializeApp(
//   keycloak: KeycloakService,
//   configService: AppConfigService,
//   edcProvider: EdcConnectorProviderService
// ): () => Promise<void> {
//   return () =>
//     configService.loadConfig()
//       .then(() =>
//         keycloak.init({
//           config: {
//             url: configService.getConfig()?.keycloakUrl!,
//             realm: configService.getConfig()?.keycloakRealm!,
//             clientId: configService.getConfig()?.keycloakClientId!
//           },
//           initOptions: {
//             onLoad: 'login-required',
//             checkLoginIframe: false
//           }
//         }))
//       .then(() => edcProvider.init());
// }
import { KeycloakService } from 'keycloak-angular';
import { AppConfigService } from './app-config.service';
import { EdcConnectorProviderService } from './edc.connector.client.provider';
 
export function initializeApp(
  keycloak: KeycloakService,
  configService: AppConfigService,
  edcProvider: EdcConnectorProviderService
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
      .then(() => {
        const kc = keycloak.getKeycloakInstance();
 
        setInterval(() => {
          kc.updateToken(60)
            .then((refreshed) => {
              if (refreshed) {
                console.log('[Keycloak] Token refreshed');
                // TODO: Check API
                edcProvider.init();
              } else {
                console.log('[Keycloak] Token still valid');
              }
            })
            .catch(() => {
              console.error('[Keycloak] Failed to refresh token, will log in again');
              kc.logout();
            });
        }, 10 * 1000);
 
        kc.onTokenExpired = () => {
          kc.updateToken(30)
            .catch(() => {
              console.error('[Keycloak] Token expired. Logging out.');
              kc.logout();
            });
        };
 
        return edcProvider.init();
      });
}