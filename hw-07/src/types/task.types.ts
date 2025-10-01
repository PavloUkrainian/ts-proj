export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: Status;
  priority: Priority;
  deadline?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string;
}

export interface FilterParams {
  createdAt?: string;
  status?: Status;
  priority?: Priority;
}

