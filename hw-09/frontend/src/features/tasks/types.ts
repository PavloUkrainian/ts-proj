export interface Task {
  id?: string;
  title: string;
  description?: string;
  createdAt?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}
