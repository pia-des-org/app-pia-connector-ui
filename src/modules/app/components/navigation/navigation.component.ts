import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { routes } from '../../app-routing.module';
import { Title } from '@angular/platform-browser';
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  routes = routes;

  constructor(
    public titleService: Title,
    private breakpointObserver: BreakpointObserver,
    private keycloak: KeycloakService) {
    document.body.classList.remove('theme-1', 'theme-2');
    document.body.classList.add('theme-1');
  }

  logout(): void {
    //TODO logout user, but what do we do after
    this.keycloak.logout(window.location.origin);
  }
}
