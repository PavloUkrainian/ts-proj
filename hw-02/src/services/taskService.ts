import type { Task, Priority, Status, RawTask } from '../types';
import { validateAndNormalize } from '../utils/taskUtils';
import { readAllRaw, writeAll } from '../utils/fileUtils';

export function loadAll(): Task[] {
  const raw = readAllRaw();
  return raw.map(validateAndNormalize);
}

export function getById(id: string): Task | undefined {
  return loadAll().find(t => t.id === id);
}

export type CreateTaskInput = Omit<Partial<RawTask>, 'id'> & { id?: string; title: string };

export function createTask(partial: CreateTaskInput): Task {
  const tasks = loadAll();

  const last = tasks.length > 0 ? tasks[tasks.length - 1] : undefined;

  let autoId: string = '1';
  if (last) {
    const n = Number(last.id);
    autoId = Number.isFinite(n) ? String(n + 1) : String(tasks.length + 1);
  }

  const nextId = partial.id ?? autoId;

  const normalized = validateAndNormalize({ ...partial, id: nextId });
  tasks.push(normalized);
  writeAll(tasks);
  return normalized;
}

export function updateTask(
  id: string,
  patch: Partial<Omit<RawTask, 'id'>>
): Task {
  const tasks = loadAll();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Task not found');

  const merged: RawTask = { ...tasks[idx], ...patch, id: tasks[idx].id };
  const normalized = validateAndNormalize(merged);
  tasks[idx] = normalized;
  writeAll(tasks);
  return normalized;
}

export function deleteTask(id: string): void {
  const tasks = loadAll();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) throw new Error('Task not found');
  writeAll(filtered);
}

export type FilterParams = {
  status?: Status;
  priority?: Priority;
  createdFrom?: string | Date;
  createdTo?: string | Date;
};

export function filterTasks(params: FilterParams): Task[] {
  const tasks = loadAll();
  const from = params.createdFrom ? new Date(params.createdFrom) : undefined;
  const to = params.createdTo ? new Date(params.createdTo) : undefined;

  return tasks.filter(t => {
    if (params.status && t.status !== params.status) return false;
    if (params.priority && t.priority !== params.priority) return false;
    const created = new Date(t.createdAt);
    if (from && created < from) return false;
    if (to && created > to) return false;
    return true;
  });
}

export function isCompletedBeforeDeadline(
  task: Task,
  completedAt: string | Date = new Date()
): boolean {
  if (!task.deadline) return true;
  const deadline = new Date(task.deadline);
  const completed = new Date(completedAt);
  return completed <= deadline;
}

