import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateKanbanCardRequest, KanbanCard, KanbanCardHistory, KanbanColumn, UpdateKanbanCardRequest } from '../models/kanban.models';

@Injectable({ providedIn: 'root' })
export class KanbanApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/kanban';

  getColumns(): Observable<KanbanColumn[]> { return this.http.get<KanbanColumn[]>(`${this.baseUrl}/columns`); }
  getCards(): Observable<KanbanCard[]> { return this.http.get<KanbanCard[]>(`${this.baseUrl}/cards`); }
  getHistory(): Observable<KanbanCardHistory[]> { return this.http.get<KanbanCardHistory[]>(`${this.baseUrl}/card-history`); }
  createCard(request: CreateKanbanCardRequest): Observable<KanbanCard> { return this.http.post<KanbanCard>(`${this.baseUrl}/cards`, request); }
  updateCard(id: number, request: UpdateKanbanCardRequest): Observable<KanbanCard> { return this.http.put<KanbanCard>(`${this.baseUrl}/cards/${id}`, request); }
  moveCard(id: number, columnId: number): Observable<KanbanCard> { return this.http.patch<KanbanCard>(`${this.baseUrl}/cards/${id}/move`, { columnId }); }
  deleteCard(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/cards/${id}`); }
}
