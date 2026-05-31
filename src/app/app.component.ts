import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ColumnId = 'backlog' | 'todo' | 'development' | 'done';

type Priority = 'Baixa' | 'Média' | 'Alta';

interface KanbanColumn {
  id: ColumnId;
  title: string;
  description: string;
}

interface MovementHistory {
  from: ColumnId | null;
  to: ColumnId;
  movedAt: string;
}

interface StageDates {
  backlog?: string;
  todo?: string;
  development?: string;
  done?: string;
}

interface KanbanTask {
  id: number;
  title: string;
  description: string;
  details: string;
  assignedTo: string;
  columnId: ColumnId;
  priority: Priority;
  createdAt: string;
  stageDates: StageDates;
  history: MovementHistory[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly columns: KanbanColumn[] = [
    { id: 'backlog', title: 'Backlog', description: 'Ideias e demandas futuras' },
    { id: 'todo', title: 'Para fazer', description: 'Tarefas prontas para iniciar' },
    { id: 'development', title: 'Em desenvolvimento', description: 'Tarefas em andamento' },
    { id: 'done', title: 'Finalizado', description: 'Entregas concluídas' }
  ];

  readonly priorities: Priority[] = ['Baixa', 'Média', 'Alta'];

  readonly newTaskTitle = signal('');
  readonly newTaskDescription = signal('');
  readonly newTaskDetails = signal('');
  readonly newTaskAssignedTo = signal('');

  readonly editingTask = signal<KanbanTask | null>(null);

  readonly tasks = signal<KanbanTask[]>([
    this.createTask({
      id: 1,
      title: 'Criar layout do quadro',
      description: 'Montar as 4 colunas principais do Kanban.',
      details: 'Criar uma tela responsiva com cards e ações de movimentação.',
      assignedTo: 'Hiego',
      columnId: 'done',
      priority: 'Média',
      createdAt: '2026-05-31T10:00:00.000Z'
    }),
    this.createTask({
      id: 2,
      title: 'Adicionar edição de card',
      description: 'Permitir alterar título, descrição e responsável.',
      details: 'Ao clicar em editar, abrir um formulário com os dados completos do card.',
      assignedTo: 'Equipe Dev',
      columnId: 'development',
      priority: 'Alta',
      createdAt: '2026-05-31T11:00:00.000Z'
    }),
    this.createTask({
      id: 3,
      title: 'Validar responsividade',
      description: 'Garantir boa visualização em desktop e celular.',
      details: 'Testar o quadro em telas pequenas e ajustar quebras das colunas.',
      assignedTo: '',
      columnId: 'todo',
      priority: 'Média',
      createdAt: '2026-05-31T12:00:00.000Z'
    }),
    this.createTask({
      id: 4,
      title: 'Integrar com API',
      description: 'Futuramente carregar tarefas do backend.',
      details: 'Criar service Angular para buscar, criar, editar e mover cards no backend.',
      assignedTo: '',
      columnId: 'backlog',
      priority: 'Baixa',
      createdAt: '2026-05-31T13:00:00.000Z'
    })
  ]);

  readonly totalTasks = computed(() => this.tasks().length);

  getTasksByColumn(columnId: ColumnId): KanbanTask[] {
    return this.tasks().filter((task) => task.columnId === columnId);
  }

  getColumnTitle(columnId: ColumnId | null): string {
    if (!columnId) {
      return 'Criação do card';
    }

    return this.columns.find((column) => column.id === columnId)?.title ?? columnId;
  }

  addTask(): void {
    const title = this.newTaskTitle().trim();
    const description = this.newTaskDescription().trim();
    const details = this.newTaskDetails().trim();
    const assignedTo = this.newTaskAssignedTo().trim();

    if (!title) {
      return;
    }

    const nextTask = this.createTask({
      id: Date.now(),
      title,
      description: description || 'Sem descrição.',
      details,
      assignedTo,
      columnId: 'backlog',
      priority: 'Média',
      createdAt: new Date().toISOString()
    });

    this.tasks.update((currentTasks) => [nextTask, ...currentTasks]);
    this.clearNewTaskForm();
  }

  openEdit(task: KanbanTask): void {
    this.editingTask.set(structuredClone(task));
  }

  closeEdit(): void {
    this.editingTask.set(null);
  }

  saveEdit(): void {
    const editedTask = this.editingTask();

    if (!editedTask || !editedTask.title.trim()) {
      return;
    }

    this.tasks.update((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editedTask.id
          ? {
              ...editedTask,
              title: editedTask.title.trim(),
              description: editedTask.description.trim() || 'Sem descrição.',
              details: editedTask.details.trim(),
              assignedTo: editedTask.assignedTo.trim()
            }
          : task
      )
    );

    this.closeEdit();
  }

  deleteEditingTask(): void {
    const task = this.editingTask();

    if (!task) {
      return;
    }

    const confirmed = confirm(
      `Deseja realmente excluir o card "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.tasks.update(currentTasks =>
      currentTasks.filter(t => t.id !== task.id)
    );

    this.closeEdit();
}

  moveTask(taskId: number, direction: 'left' | 'right'): void {
    this.tasks.update((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const currentIndex = this.columns.findIndex((column) => column.id === task.columnId);
        const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
        const nextColumn = this.columns[nextIndex];

        if (!nextColumn) {
          return task;
        }

        const movedAt = new Date().toISOString();

        return {
          ...task,
          columnId: nextColumn.id,
          stageDates: {
            ...task.stageDates,
            [nextColumn.id]: movedAt
          },
          history: [
            ...task.history,
            {
              from: task.columnId,
              to: nextColumn.id,
              movedAt
            }
          ]
        };
      })
    );
  }

  removeTask(taskId: number): void {
    this.tasks.update((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  canMove(task: KanbanTask, direction: 'left' | 'right'): boolean {
    const currentIndex = this.columns.findIndex((column) => column.id === task.columnId);
    return direction === 'right' ? currentIndex < this.columns.length - 1 : currentIndex > 0;
  }

  formatDate(date?: string): string {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  private clearNewTaskForm(): void {
    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.newTaskDetails.set('');
    this.newTaskAssignedTo.set('');
  }

  private createTask(task: Omit<KanbanTask, 'stageDates' | 'history'>): KanbanTask {
    return {
      ...task,
      stageDates: {
        [task.columnId]: task.createdAt
      },
      history: [
        {
          from: null,
          to: task.columnId,
          movedAt: task.createdAt
        }
      ]
    };
  }
}
