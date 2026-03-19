import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideKeycloak,
  withAutoRefreshToken,
  includeBearerTokenInterceptor,
  AutoRefreshTokenService,
  KeycloakService,
  UserActivityService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
} from 'keycloak-angular';

import { routes } from './app.routes';
import { keycloakConfig } from './keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor])
    ),
    provideKeycloak({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout',
          sessionTimeout: 60000 * 30,
        }),
      ],
    }),
    AutoRefreshTokenService,
    UserActivityService,
    KeycloakService,
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [{ urlPattern: /^http:\/\/localhost:8888(\/.*)?$/ }],
    },
  ],
};
