export const STATUSES = ['todo', 'in_progress', 'done'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;

export type Status = typeof STATUSES[number];
export type Priority = typeof PRIORITIES[number];

type TaskBase = {
  title: string;
  description?: string;
  createdAt?: string | Date;
  status?: Status;
  priority?: Priority;
  deadline?: string | Date;
};

export type RawTask = TaskBase & { id?: string };

export type Task = Omit<TaskBase, 'status' | 'priority' | 'createdAt'> &
  Required<Pick<TaskBase, 'status' | 'priority'>> & {
    id: string;
    createdAt: string;
    status: Status;
    priority: Priority;
    deadline?: string;
  };

