import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  CreateKanbanCardRequest,
  KanbanCard,
  KanbanCardHistory,
  KanbanColumn,
  Priority,
  UpdateKanbanCardRequest
} from './models/kanban.models';
import { KanbanApiService } from './services/kanban-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly kanbanApi = inject(KanbanApiService);

  readonly fallbackColumns: KanbanColumn[] = [
    { id: 1, title: 'Backlog', description: 'Ideias e demandas futuras', position: 1 },
    { id: 2, title: 'Para fazer', description: 'Tarefas prontas para iniciar', position: 2 },
    { id: 3, title: 'Em desenvolvimento', description: 'Tarefas em andamento', position: 3 },
    { id: 4, title: 'Finalizado', description: 'Entregas concluídas', position: 4 }
  ];

  readonly columns = signal<KanbanColumn[]>([]);
  readonly tasks = signal<KanbanCard[]>([]);
  readonly priorities: Priority[] = ['Baixa', 'Média', 'Alta'];
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly newTaskTitle = signal('');
  readonly newTaskDescription = signal('');
  readonly newTaskDetails = signal('');
  readonly newTaskAssignedTo = signal('');
  readonly editingTask = signal<KanbanCard | null>(null);
  readonly totalTasks = computed(() => this.tasks().length);

  ngOnInit(): void {
    this.loadBoard();
  }

  loadBoard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      columns: this.kanbanApi.getColumns(),
      cards: this.kanbanApi.getCards(),
      history: this.kanbanApi.getHistory()
    }).subscribe({
      next: ({ columns, cards, history }) => {
        this.columns.set((columns.length ? columns : this.fallbackColumns).slice().sort((a, b) => a.position - b.position));
        this.tasks.set(this.attachHistory(cards, history));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar o quadro:', error);
        this.columns.set(this.fallbackColumns);
        this.errorMessage.set('Não foi possível carregar os dados. Verifique se o backend está rodando na porta 8080.');
        this.loading.set(false);
      }
    });
  }

  getTasksByColumn(columnId: number): KanbanCard[] {
    return this.tasks().filter((task) => task.columnId === columnId);
  }

  getColumnTitle(columnId: number | null): string {
    if (columnId === null) return 'Criação do card';
    return this.columns().find((column) => column.id === columnId)?.title ?? `Coluna ${columnId}`;
  }

  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title || this.saving()) return;

    const backlog = this.columns().find((column) => column.position === 1 || column.title.toLowerCase() === 'backlog');
    if (!backlog) {
      this.errorMessage.set('A coluna Backlog não foi encontrada.');
      return;
    }

    const request: CreateKanbanCardRequest = {
      title,
      description: this.newTaskDescription().trim() || 'Sem descrição.',
      details: this.newTaskDetails().trim(),
      assignedTo: this.newTaskAssignedTo().trim(),
      columnId: backlog.id,
      priority: 'Média'
    };

    this.saving.set(true);
    this.kanbanApi.createCard(request).subscribe({
      next: (created) => {
        this.tasks.update((cards) => [{ ...created, history: [] }, ...cards]);
        this.clearNewTaskForm();
        this.saving.set(false);
        this.reloadHistory();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Não foi possível criar o card.');
        this.saving.set(false);
      }
    });
  }

  openEdit(task: KanbanCard): void { this.editingTask.set(structuredClone(task)); }
  closeEdit(): void { this.editingTask.set(null); }

  saveEdit(): void {
    const task = this.editingTask();
    if (!task || !task.title.trim() || this.saving()) return;

    const request: UpdateKanbanCardRequest = {
      title: task.title.trim(),
      description: task.description.trim() || 'Sem descrição.',
      details: task.details.trim(),
      assignedTo: task.assignedTo.trim(),
      priority: task.priority
    };

    this.saving.set(true);
    this.kanbanApi.updateCard(task.id, request).subscribe({
      next: (updated) => {
        this.tasks.update((cards) => cards.map((card) => card.id === updated.id ? { ...updated, history: card.history ?? [] } : card));
        this.saving.set(false);
        this.closeEdit();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Não foi possível salvar as alterações.');
        this.saving.set(false);
      }
    });
  }

  deleteEditingTask(): void {
    const task = this.editingTask();
    if (!task || this.saving()) return;
    if (confirm(`Deseja realmente excluir o card "${task.title}"?`)) this.deleteTask(task.id, true);
  }

  removeTask(taskId: number): void {
    const task = this.tasks().find((item) => item.id === taskId);
    if (task && !this.saving() && confirm(`Deseja realmente excluir o card "${task.title}"?`)) this.deleteTask(taskId, false);
  }

  moveTask(taskId: number, direction: 'left' | 'right'): void {
    const task = this.tasks().find((item) => item.id === taskId);
    if (!task || this.saving()) return;

    const currentIndex = this.columns().findIndex((column) => column.id === task.columnId);
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    const nextColumn = this.columns()[nextIndex];
    if (!nextColumn) return;

    this.saving.set(true);
    this.kanbanApi.moveCard(taskId, nextColumn.id).subscribe({
      next: (updated) => {
        this.tasks.update((cards) => cards.map((card) => card.id === updated.id ? { ...updated, history: card.history ?? [] } : card));
        this.saving.set(false);
        this.reloadHistory();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Não foi possível mover o card.');
        this.saving.set(false);
      }
    });
  }

  canMove(task: KanbanCard, direction: 'left' | 'right'): boolean {
    const index = this.columns().findIndex((column) => column.id === task.columnId);
    return index >= 0 && (direction === 'right' ? index < this.columns().length - 1 : index > 0);
  }

  formatDate(date?: string | null): string {
    if (!date) return '-';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
  }

  private deleteTask(taskId: number, closeModal: boolean): void {
    this.saving.set(true);
    this.kanbanApi.deleteCard(taskId).subscribe({
      next: () => {
        this.tasks.update((cards) => cards.filter((card) => card.id !== taskId));
        this.saving.set(false);
        if (closeModal) this.closeEdit();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Não foi possível excluir o card.');
        this.saving.set(false);
      }
    });
  }

  private reloadHistory(): void {
    this.kanbanApi.getHistory().subscribe({
      next: (history) => this.tasks.update((cards) => this.attachHistory(cards, history)),
      error: (error) => console.error('Erro ao recarregar histórico:', error)
    });
  }

  private attachHistory(cards: KanbanCard[], history: KanbanCardHistory[]): KanbanCard[] {
    return cards.map((card) => ({
      ...card,
      history: history
        .filter((item) => item.cardId === card.id)
        .sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime())
    }));
  }

  private clearNewTaskForm(): void {
    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.newTaskDetails.set('');
    this.newTaskAssignedTo.set('');
  }
}
