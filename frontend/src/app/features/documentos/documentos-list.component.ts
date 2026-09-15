import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentosService, Documento } from './documentos.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Gestão de Documentos</h2>

      <!-- Form de Novo Documento -->
      <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; borderRadius: 8px;">
        <h3>Novo Documento</h3>
        <div style="margin-bottom: 10px;">
          <input [(ngModel)]="novoTitulo" placeholder="Título do Documento" style="width: 300px; padding: 8px;" />
        </div>
        <div style="margin-bottom: 10px;">
          <textarea [(ngModel)]="novaDescricao" placeholder="Descrição" style="width: 300px; padding: 8px;"></textarea>
        </div>
        <button (click)="criarDocumento()" style="padding: 8px 16px; background-color: #007bff; color: white; border: none; borderRadius: 4px; cursor: pointer;">
          Salvar
        </button>
      </div>

      <!-- Tabela de Listagem -->
      <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>Título</th>
            <th>Descrição</th>
            <th>Criado Por</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let doc of documentos">
            <td>{{ doc.titulo }}</td>
            <td>{{ doc.descricao }}</td>
            <td>{{ doc.criadoPor }}</td>
            <td>{{ doc.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <!-- Botão visível APENAS para usuários com role gestao_admin -->
              <button *hasRole="'gestao_admin'" 
                      (click)="deletarDocumento(doc.id)"
                      style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; borderRadius: 4px; cursor: pointer;">
                Deletar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class DocumentosListComponent implements OnInit {
  private documentosService = inject(DocumentosService);

  documentos: Documento[] = [];
  novoTitulo = '';
  novaDescricao = '';

  ngOnInit(): void {
    this.carregarDocumentos();
  }

  carregarDocumentos(): void {
    this.documentosService.getDocumentos().subscribe({
      next: (docs) => this.documentos = docs,
      error: (err) => console.error('Erro ao carregar documentos', err)
    });
  }

  criarDocumento(): void {
    if (!this.novoTitulo.trim()) return;

    this.documentosService.createDocumento({
      titulo: this.novoTitulo,
      descricao: this.novaDescricao
    }).subscribe({
      next: () => {
        this.novoTitulo = '';
        this.novaDescricao = '';
        this.carregarDocumentos();
      },
      error: (err) => console.error('Erro ao criar documento', err)
    });
  }

  deletarDocumento(id: string): void {
    if (confirm('Tem certeza que deseja remover este documento?')) {
      this.documentosService.deleteDocumento(id).subscribe({
        next: () => this.carregarDocumentos(),
        error: (err) => console.error('Erro ao deletar documento', err)
      });
    }
  }
}
