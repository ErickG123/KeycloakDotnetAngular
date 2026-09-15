import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'documentos',
    loadComponent: () => import('./features/documentos/documentos-list.component').then(m => m.DocumentosListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [roleGuard],
    data: { roles: ['gestao_admin'] }
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/auth/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  { path: '**', redirectTo: 'login' }
];
