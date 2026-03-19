import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
})
export class Home {
  private readonly keycloak = inject(Keycloak);
  private readonly router = inject(Router);

  isAuthenticated = signal(false);
  username = signal<string | undefined>(undefined);

  constructor() {
    this.isAuthenticated.set(this.keycloak.authenticated ?? false);
    this.username.set(this.keycloak.tokenParsed?.['preferred_username']);
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/bills' });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  goToBills(): void {
    this.router.navigate(['/bills']);
  }
}

