import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly keycloak = inject(Keycloak);

  isAuthenticated = signal(this.keycloak.authenticated ?? false);
  username = signal<string | undefined>(this.keycloak.tokenParsed?.['preferred_username']);

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
