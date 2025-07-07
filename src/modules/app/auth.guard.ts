import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        console.log('[AuthGuard] Token refreshed');
      } else {
        console.log('[AuthGuard] Token still valid');
      }
      return true;
    } catch (error) {
      console.error('[AuthGuard] Token refresh failed, logging out');
      this.keycloak.logout(window.location.href);
      return false;
    }
  }
}
