export type Priority = 'Baixa' | 'Média' | 'Alta';

export interface KanbanColumn {
  id: number;
  title: string;
  description: string;
  position: number;
}

export interface KanbanCardHistory {
  id?: number;
  cardId: number;
  fromColumnId: number | null;
  toColumnId: number;
  movedAt: string;
}

export interface KanbanCard {
  id: number;
  title: string;
  description: string;
  details: string;
  assignedTo: string;
  columnId: number;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  backlogAt?: string | null;
  todoAt?: string | null;
  developmentAt?: string | null;
  doneAt?: string | null;
  history?: KanbanCardHistory[];
}

export interface CreateKanbanCardRequest {
  title: string;
  description: string;
  details: string;
  assignedTo: string;
  columnId: number;
  priority: Priority;
}

export interface UpdateKanbanCardRequest {
  title: string;
  description: string;
  details: string;
  assignedTo: string;
  priority: Priority;
}
