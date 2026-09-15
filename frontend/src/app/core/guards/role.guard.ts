import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Garante que o estado OIDC esteja inicializado
  await authService.ensureInitialized();

  const isLoggedIn = await authService.isLoggedIn();
  const expectedRoles = (route.data?.['roles'] as string[]) || [];
  const userRoles = authService.getUserRoles();

  console.log('[RoleGuard] Rota requisitada:', state.url);
  console.log('[RoleGuard] Roles exigidas na rota:', expectedRoles);
  console.log('[RoleGuard] Roles presentes no usuário:', userRoles);
  console.log('[RoleGuard] Autenticado?:', isLoggedIn);

  if (!isLoggedIn) {
    console.warn('[RoleGuard] Usuário não está autenticado. Redirecionando para login...');
    await authService.login(window.location.origin + state.url);
    return false;
  }

  if (expectedRoles.length === 0) {
    return true;
  }

  const hasAccess = authService.hasAnyRole(expectedRoles);

  if (!hasAccess) {
    console.warn(`[RoleGuard] ACESSO NEGADO para '${state.url}'. Exigidas: [${expectedRoles.join(', ')}], Usuário possui: [${userRoles.join(', ')}]`);
    await router.navigate(['/access-denied']);
    return false;
  }

  return true;
};
