export interface Task {
  id?: string;
  title: string;
  description?: string;
  createdAt?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}
