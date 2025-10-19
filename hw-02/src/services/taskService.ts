import fs from 'node:fs';
import path from 'node:path';
import type { Task, Priority, Status, RawTask } from '../dto/Task';
import { validateAndNormalize } from '../utils/taskUtils';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/tasks.json');

function readAllRaw(): RawTask[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(tasks: Task[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
}

export function loadAll(): Task[] {
  const raw = readAllRaw();
  return raw.map(validateAndNormalize);
}

export function getById(id: string | number): Task | undefined {
  return loadAll().find(t => String(t.id) === String(id));
}

export type CreateTaskInput = Omit<Partial<RawTask>, 'id'> & { id?: string | number; title: string };

export function createTask(partial: CreateTaskInput): Task {
  const tasks = loadAll();

  const last = tasks.length > 0 ? tasks[tasks.length - 1] : undefined;

  let autoId: string | number = 1;
  if (last) {
    const n = Number(last.id);
    autoId = Number.isFinite(n) ? n + 1 : String(tasks.length + 1);
  }

  const nextId = partial.id ?? autoId;

  const normalized = validateAndNormalize({ ...partial, id: nextId });
  tasks.push(normalized);
  writeAll(tasks);
  return normalized;
}

export function updateTask(
  id: string | number,
  patch: Partial<Omit<RawTask, 'id'>>
): Task {
  const tasks = loadAll();
  const idx = tasks.findIndex(t => String(t.id) === String(id));
  if (idx === -1) throw new Error('Task not found');

  const merged: RawTask = { ...tasks[idx], ...patch, id: tasks[idx].id };
  const normalized = validateAndNormalize(merged);
  tasks[idx] = normalized;
  writeAll(tasks);
  return normalized;
}

export function deleteTask(id: string | number): void {
  const tasks = loadAll();
  const filtered = tasks.filter(t => String(t.id) !== String(id));
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
  if (task.status !== 'done') {
    return completed <= deadline;
  }
  return completed <= deadline;
}

