import type { Task } from './types';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Отримання всіх задач (GET)
 */
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Отримання задачі за ID (GET)
 */
export async function getTaskById(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Створення задачі (POST)
 */
export async function createTask(
  task: Omit<Task, 'id' | 'createdAt'>
): Promise<Task> {
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
