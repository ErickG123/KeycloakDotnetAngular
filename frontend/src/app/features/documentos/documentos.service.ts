import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Documento {
  id: string;
  titulo: string;
  descricao: string;
  criadoPor: string;
  dataCriacao: string;
}

export interface CreateDocumentoPayload {
  titulo: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/documentos';

  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  createDocumento(payload: CreateDocumentoPayload): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, payload);
  }

  deleteDocumento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
