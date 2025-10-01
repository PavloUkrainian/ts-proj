const API_BASE_URL = 'http://localhost:3000';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  createdAt?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

/**
 * Створення задачі (POST)
 */
export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...task,
      createdAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  return response.json();
}

