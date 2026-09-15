import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'documentos', pathMatch: 'full' },
  {
    path: 'documentos',
    loadComponent: () => import('./features/documentos/documentos-list.component').then(m => m.DocumentosListComponent),
    canActivate: [authGuard] // Apenas checa se o usuario esta logado no sistema
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [roleGuard], // Restrito especificamente para gestao_admin
    data: { roles: ['gestao_admin'] }
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/auth/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  { path: '**', redirectTo: 'documentos' }
];
