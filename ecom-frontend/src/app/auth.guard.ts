import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { createAuthGuard, AuthGuardData } from 'keycloak-angular';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  { authenticated, keycloak }: AuthGuardData
): Promise<boolean | UrlTree> => {
  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + '/#' + state.url });
    return false;
  }
  return true;
};

export const authGuard = createAuthGuard(isAccessAllowed);

