export const STATUS_VALUES = ['todo', 'in_progress', 'review', 'done'] as const;
export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

export type Status = (typeof STATUS_VALUES)[number];
export type Priority = (typeof PRIORITY_VALUES)[number];

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

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'userId'>>;

export interface FilterParams {
  createdAt?: string;
  status?: Status;
  priority?: Priority;
}
