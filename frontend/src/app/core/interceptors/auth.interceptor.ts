import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Intercepta requisições destinadas à API backend (POST/GET/DELETE)
  if (req.url.includes('/api/') || req.url.includes('localhost:5000')) {
    const token = authService.getAccessToken();

    let authReq = req;
    if (token) {
      console.debug(`🌐 [authInterceptor] Injecting Bearer Token into [${req.method}] ${req.url}`);
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.warn(`⚠️ [authInterceptor] Warning: Sending [${req.method}] ${req.url} without Bearer Token.`);
    }

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('⛔ [authInterceptor] 401 Unauthorized do Backend. Redirecionando para /login...');
          authService.logout();
        } else if (error.status === 403) {
          console.error('⛔ [authInterceptor] 403 Forbidden do Backend. Redirecionando para /access-denied...');
          router.navigate(['/access-denied']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
