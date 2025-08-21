import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {NavigationComponent} from './components/navigation/navigation.component';
import {EdcDemoModule} from '../edc-demo/edc-demo.module';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {AppConfigService} from "./app-config.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API, CONNECTOR_RECEIVER_API} from "./variables";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {MatMenuModule} from "@angular/material/menu";
import { KeycloakAngularModule, KeycloakService, KeycloakBearerInterceptor } from 'keycloak-angular';
import {initializeApp} from './keycloak-init.factory';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import { MarkdownModule } from 'ngx-markdown';
import {EdcConnectorProviderService} from "./edc.connector.client.provider";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    EdcDemoModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatMenuModule,
    KeycloakAngularModule,
    HttpClientModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    TranslateModule.forRoot({
      defaultLanguage: 'es-ES',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [KeycloakService, AppConfigService, EdcConnectorProviderService],
      multi: true,
    },
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    {
      provide: CONNECTOR_MANAGEMENT_API,
      useFactory: (s: AppConfigService) => s.getConfig()?.managementApiUrl,
      deps: [AppConfigService]
    },
    {
      provide: CONNECTOR_CATALOG_API,
      useFactory:  (s: AppConfigService) => s.getConfig()?.catalogUrl,
      deps: [AppConfigService]
    },
    {
      provide: CONNECTOR_RECEIVER_API,
      useFactory:  (s: AppConfigService) => s.getConfig()?.receiverUrl,
      deps: [AppConfigService]
    },
    {
      provide: 'HOME_CONNECTOR_STORAGE_ACCOUNT',
      useFactory: (s: AppConfigService) => s.getConfig()?.storageAccount,
      deps: [AppConfigService]
    },
    {
      provide: 'STORAGE_TYPES',
      useFactory: () => [{id: "AzureStorage", name: "AzureStorage"}, {id: "AmazonS3", name: "AmazonS3"}],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    const iconsOfNavigation = ['assets', 'contracts', 'offers', 'policies', 'transfers'];
    iconsOfNavigation.forEach(name => {
      iconRegistry.addSvgIconInNamespace(
        'navigation',
        name,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/navigation_bar_${name}.svg`)
      );
    });

    const iconsOfContracts = ['asset', 'provider', 'signing_date', 'title', 'transfers'];
    iconsOfContracts.forEach(name => {
      iconRegistry.addSvgIconInNamespace(
        'contracts',
        name,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/contracts_viewer_${name}.svg`)
      );
    });

    const iconsOfNegotiate = ['properties', 'title'];
    iconsOfNegotiate.forEach(name => {
      iconRegistry.addSvgIconInNamespace(
        'negotiate',
        name,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/negotiate_${name}.svg`)
      );
    });

    iconRegistry.addSvgIconInNamespace(
      'dataOffer',
      "title",
      sanitizer.bypassSecurityTrustResourceUrl(`assets/data_offer_viewer.svg`)
    );

    iconRegistry.addSvgIconInNamespace(
      'policy',
      "title",
      sanitizer.bypassSecurityTrustResourceUrl(`assets/policy_viewer.svg`)
    );

    iconRegistry.addSvgIconInNamespace(
      'assetDetails',
      "property",
      sanitizer.bypassSecurityTrustResourceUrl(`assets/asset_details_icon.svg`)
    );

    iconRegistry.addSvgIconInNamespace(
      'assetViewer',
      "title",
      sanitizer.bypassSecurityTrustResourceUrl(`assets/asset_viewer_icon.svg`)
    );

  }
}
