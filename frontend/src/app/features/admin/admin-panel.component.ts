import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Painel Administrativo</h2>
      <p style="color: #28a745; font-weight: bold;">Bem-vindo, Administrador! Área restrita para a role 'gestao_admin'.</p>
    </div>
  `
})
export class AdminPanelComponent {}
