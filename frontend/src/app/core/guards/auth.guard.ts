import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('[AuthGuard] Usuário não autenticado no storage. Redirecionando para /login...');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
