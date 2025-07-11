import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';
import {KeycloakService} from "keycloak-angular";
import {Ecosystem} from "./ecosystem.enum";
import {AppTitleService} from "../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {EcosystemService} from "../services/ecosystem.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isHandset$!: Observable<boolean>;
  pageTitle$!: Observable<string>;
  currentLang = 'Spanish';
  languages = [
    { code: 'en-US', label: 'English' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'ca-ES', label: 'Catalan' },
    { code: 'gl-ES', label: 'Galician' },
    { code: 'eu-ES', label: 'Basque' }
  ];
  username: string | undefined;

  constructor(
    public titleService: AppTitleService,
    private breakpointObserver: BreakpointObserver,
    private keycloak: KeycloakService,
    private translate: TranslateService,
    private ecosystemService: EcosystemService
  ) {
    document.body.classList.remove('theme-1', 'theme-2');
    this.pageTitle$ = this.titleService.pageTitle$;
    this.loadEcosystemClaim();

    const browserLang = navigator.language || navigator.languages[0];
    const matched = this.languages.find(lang => lang.code === browserLang) || this.languages[0];
    this.translate.setDefaultLang('es-ES');
    this.translate.use(matched?.code || 'es-ES');
    this.currentLang = matched?.label || 'Spanish';

    this.ecosystemService.applyEcosystemSettings();

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  switchLanguage(langCode: string): void {
    this.translate.use(langCode);
    const lang = this.languages.find(l => l.code === langCode);
    this.currentLang = lang?.label || langCode;
  }

  private loadEcosystemClaim() {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
    const groups = tokenParsed?.['groups'] as string[];
    const bpn = tokenParsed?.['bpn'] as string;

    this.username = tokenParsed?.name || 'User';
    this.ecosystemService.bpn = bpn || '';

    if (groups?.includes(Ecosystem.ASTURIAS)) {
      this.ecosystemService.ecosystem = Ecosystem.ASTURIAS;
    } else {
      this.ecosystemService.ecosystem = Ecosystem.SEGITTUR;
    }
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }
}

