import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  template: `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #dc3545;">403 - Acesso Negado</h1>
      <p>Você não possui a permissão necessária para acessar este recurso.</p>
      <a href="/documentos">Voltar para Documentos</a>
    </div>
  `
})
export class AccessDeniedComponent {}
