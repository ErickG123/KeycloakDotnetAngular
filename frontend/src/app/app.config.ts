import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    KeycloakService,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => {
      const keycloak = inject(KeycloakService);

      // Verificação defensiva de limpeza de sessão corrompida
      try {
        const storedState = localStorage.getItem('kc-callback-error');
        if (storedState) {
          localStorage.removeItem('kc-callback-error');
          sessionStorage.clear();
        }
      } catch (e) {
        // Ignora erros de acesso ao storage
      }

      return keycloak.init({
        config: {
          url: 'http://localhost:8080',
          realm: 'gestao-realm',
          clientId: 'gestao-frontend'
        },
        initOptions: {
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
        },
        enableBearerInterceptor: false
      }).then(authenticated => {
        console.log(`🔑 [KeycloakInit] Inicialização concluída. Autenticado: ${authenticated}`);
        return authenticated;
      }).catch(err => {
        console.error('⚠️ [KeycloakInit] Erro ao conectar ao Keycloak. A aplicação iniciará em modo desacoplado.', err);
        return false;
      });
    })
  ]
};
