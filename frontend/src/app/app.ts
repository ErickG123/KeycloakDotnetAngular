import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <header *ngIf="isLoggedIn" style="background: #333; color: white; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="margin: 0; font-size: 20px;">Sistema de Gestão</h1>
      <nav style="display: flex; gap: 15px; align-items: center;">
        <a routerLink="/documentos" style="color: white; text-decoration: none;">Documentos</a>
        
        <!-- Renderização reativa do Painel Admin escutando o Signal currentUserRoles -->
        <a *ngIf="isAdmin" routerLink="/admin" style="color: #ffc107; font-weight: bold; text-decoration: none;">
          Painel Admin
        </a>

        <button (click)="logout()" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
          Sair
        </button>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  private authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('gestao_admin');
  }

  logout(): void {
    this.authService.logout();
  }
}
