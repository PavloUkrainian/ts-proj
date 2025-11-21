const API_BASE_URL = 'http://localhost:3000';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: TaskStatus;
  priority: TaskPriority;
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

/**
 * Оновлення задачі (PUT)
 */
export async function updateTask(id: string, task: Task): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Часткове оновлення задачі (PATCH)
 */
export async function patchTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to patch task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Отримання деталей завдання за id (GET)
 */
export async function getTaskById(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to get task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Видалення завдання (DELETE)
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
}

/**
 * Перегляд списку завдань (GET)
 * Повертає список завдань з назвою, описом, датою створення, статусом та пріоритетом
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    console.log('Запит до:', `${API_BASE_URL}/tasks`);
    const response = await fetch(`${API_BASE_URL}/tasks`);

    if (!response.ok) {
      console.error('Помилка відповіді:', response.status, response.statusText);
      throw new Error(`Failed to get tasks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Отримано дані:', data);
    return data;
  } catch (error) {
    console.error('Помилка fetch:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не вдалося підключитися до сервера. Переконайтеся, що json-server запущений на порту 3000.');
    }
    throw error;
  }
}

