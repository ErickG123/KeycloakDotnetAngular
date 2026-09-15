import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenUrl = 'http://localhost:8080/realms/gestao-realm/protocol/openid-connect/token';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Angular Signal reativo para o estado do usuario logado e suas roles
  public currentUserRoles = signal<string[]>(this.getUserRolesFromStorage());

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new HttpParams()
      .set('client_id', 'gestao-frontend')
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(this.tokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
        
        // Atualiza o Signal reativo de roles imediatamente apos login
        const roles = this.getUserRolesFromStorage();
        this.currentUserRoles.set(roles);

        console.log('✅ [AuthService] Login realizado com sucesso. Roles no Signal:', roles);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserRoles.set([]);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Decodificação segura de Payload JWT utilizando atob com suporte a UTF-8 e padding Base64
   */
  getDecodedToken(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('❌ [AuthService] Erro ao decodificar token JWT:', e);
      return null;
    }
  }

  /**
   * Extrai e consolida Realm Roles, Resource Roles e claims de fallback do token decodificado
   */
  private getUserRolesFromStorage(): string[] {
    const decoded = this.getDecodedToken();
    if (!decoded) return [];

    const roles: string[] = [];

    // 1. Realm Roles (realm_access.roles)
    if (decoded.realm_access?.roles && Array.isArray(decoded.realm_access.roles)) {
      roles.push(...decoded.realm_access.roles);
    }

    // 2. Direct Claim 'roles'
    if (decoded.roles && Array.isArray(decoded.roles)) {
      roles.push(...decoded.roles);
    }

    // 3. Client/Resource Roles (resource_access[client].roles)
    if (decoded.resource_access) {
      Object.keys(decoded.resource_access).forEach(client => {
        const clientRoles = decoded.resource_access[client]?.roles;
        if (Array.isArray(clientRoles)) {
          roles.push(...clientRoles);
        }
      });
    }

    // Rule Fallback: Se o username for admin.sistema, atribui gestao_admin e gestao_user
    if (decoded.preferred_username === 'admin.sistema' && !roles.includes('gestao_admin')) {
      roles.push('gestao_admin', 'gestao_user');
    }

    const consolidatedRoles = Array.from(new Set(roles.map(r => r.toLowerCase())));
    console.log('[AuthService] Roles decodificadas:', consolidatedRoles);
    return consolidatedRoles;
  }

  getUserRoles(): string[] {
    return this.currentUserRoles();
  }

  hasRole(role: string): boolean {
    if (!role) return false;
    return this.currentUserRoles().includes(role.toLowerCase());
  }

  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.currentUserRoles();
    return roles.some(r => userRoles.includes(r.toLowerCase()));
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) return false;

    const isExpired = Date.now() >= decoded.exp * 1000;
    if (isExpired) {
      this.logout();
      return false;
    }

    return true;
  }
}
