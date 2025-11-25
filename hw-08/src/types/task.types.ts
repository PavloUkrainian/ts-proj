export const STATUS_VALUES = ['todo', 'in_progress', 'done'] as const;
export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

export type Status = typeof STATUS_VALUES[number];
export type Priority = typeof PRIORITY_VALUES[number];

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
  userId: number;
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

