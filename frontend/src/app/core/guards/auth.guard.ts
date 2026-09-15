import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  // Se a URL contém parâmetros de callback do Keycloak (?code= / ?state=), permite a navegação sem disparar re-login
  if (window.location.search.includes('code=') || window.location.search.includes('state=')) {
    return true;
  }

  const isLoggedIn = await authService.isLoggedIn();

  console.log('[AuthGuard] Rota requisitada:', state.url);
  console.log('[AuthGuard] Autenticado?:', isLoggedIn);

  if (!isLoggedIn) {
    console.warn('[AuthGuard] Usuário não autenticado. Redirecionando para login no Keycloak...');
    await authService.login(window.location.origin + state.url);
    return false;
  }

  return true;
};
