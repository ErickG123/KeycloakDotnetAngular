import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('[RoleGuard] Usuário não está autenticado. Redirecionando para /login...');
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = (route.data?.['roles'] as string[]) || [];
  if (expectedRoles.length === 0) return true;

  const hasAccess = authService.hasAnyRole(expectedRoles);
  const userRoles = authService.getUserRoles();

  if (!hasAccess) {
    console.warn(`[RoleGuard] ACESSO NEGADO para '${state.url}'. Exigidas: [${expectedRoles.join(', ')}], Usuário possui: [${userRoles.join(', ')}]`);
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};
