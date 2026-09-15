import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);

  /**
   * Verifica de forma segura se a instância do Keycloak está pronta e autenticada
   */
  async ensureInitialized(): Promise<boolean> {
    try {
      const instance = this.keycloak.getKeycloakInstance();
      if (!instance) {
        return false;
      }
      return instance.authenticated ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Consolida Realm Roles e Client Roles extraídas do token JWT com busca insensível a maiúsculas/minúsculas
   */
  getUserRoles(): string[] {
    const roles: string[] = [];

    try {
      const instance = this.keycloak.getKeycloakInstance();
      const tokenParsed = instance?.tokenParsed as any;

      if (!tokenParsed) {
        return this.keycloak.getUserRoles(true).map(r => r.toLowerCase());
      }

      if (tokenParsed.realm_access?.roles && Array.isArray(tokenParsed.realm_access.roles)) {
        roles.push(...tokenParsed.realm_access.roles);
      }

      if (tokenParsed.resource_access) {
        Object.keys(tokenParsed.resource_access).forEach(client => {
          const clientRoles = tokenParsed.resource_access[client]?.roles;
          if (Array.isArray(clientRoles)) {
            roles.push(...clientRoles);
          }
        });
      }

      return Array.from(new Set(roles.map(r => r.toLowerCase())));
    } catch (error) {
      console.error('❌ [AuthService] Erro ao extrair roles do token JWT:', error);
      return this.keycloak.getUserRoles(true).map(r => r.toLowerCase());
    }
  }

  hasRole(role: string): boolean {
    if (!role) return false;
    return this.getUserRoles().includes(role.toLowerCase());
  }

  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.getUserRoles();
    return roles.some(r => userRoles.includes(r.toLowerCase()));
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.keycloak.isLoggedIn();
    } catch {
      return false;
    }
  }

  async login(redirectUri?: string): Promise<void> {
    // Evita chamadas de login redundantes se a URL já contiver parâmetros do callback de OAuth (?code= ou ?state=)
    if (window.location.search.includes('code=') || window.location.search.includes('state=')) {
      console.log('🔄 [AuthService] Callback de autorização em processamento. Aguardando troca do token...');
      return;
    }

    const targetUri = redirectUri || (window.location.origin + '/documentos');
    console.log('🚪 [AuthService] Redirecionando para login no Keycloak. Target:', targetUri);

    await this.keycloak.login({
      redirectUri: targetUri
    });
  }

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin);
  }
}
