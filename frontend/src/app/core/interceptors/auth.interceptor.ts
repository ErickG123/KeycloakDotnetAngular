import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  // Intercepta chamadas direcionadas para a API backend (tanto http://localhost:5000/api/ quanto URLs relativas /api/)
  if (req.url.includes('/api/') || req.url.includes('localhost:5000')) {
    return from(Promise.resolve(keycloak.isLoggedIn())).pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return from(Promise.resolve(keycloak.getToken())).pipe(
            switchMap(token => {
              console.debug('🌐 [authInterceptor] Anexando Bearer Token na requisição:', req.url);
              const authReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next(authReq);
            })
          );
        }
        console.warn('⚠️ [authInterceptor] Requisição para API disparada sem usuário logado:', req.url);
        return next(req);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('⛔ [authInterceptor] Resposta 401 Unauthorized recebida do Backend .NET.');
        } else if (error.status === 403) {
          console.error('⛔ [authInterceptor] Resposta 403 Forbidden recebida do Backend .NET. Redirecionando para /access-denied');
          router.navigate(['/access-denied']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
