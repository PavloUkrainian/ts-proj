import { DEFAULT_PRIORITY, DEFAULT_STATUS, NOW_ISO } from '../constants';
import type { Task, Priority, Status, RawTask } from '../dto/Task';

export const isStatus = (v: any): v is Status =>
  v === 'todo' || v === 'in_progress' || v === 'done';

export const isPriority = (v: any): v is Priority =>
  v === 'low' || v === 'medium' || v === 'high';

export const toIso = (d?: string | Date): string | undefined => {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString();
  const dt = new Date(d);
  return isNaN(+dt) ? undefined : dt.toISOString();
};

export function validateAndNormalize(input: RawTask): Task {
  if (input == null || typeof input !== 'object') throw new Error('Task must be an object');
  if (input.id === undefined || input.title === undefined) {
    throw new Error('Task.id and Task.title are required');
  }
  if (String(input.id).trim() === '') throw new Error('Task.id must be non-empty');
  if (String(input.title).trim() === '') throw new Error('Task.title must be non-empty');

  const createdAtIso = toIso(input.createdAt) ?? NOW_ISO();
  const status: Status = isStatus(input.status) ? input.status : DEFAULT_STATUS;
  const priority: Priority = isPriority(input.priority) ? input.priority : DEFAULT_PRIORITY;

  const desc = input.description !== undefined ? String(input.description) : undefined;
  const deadlineIso = toIso(input.deadline);

  const normalized: Task = {
    id: input.id,
    title: String(input.title),
    createdAt: createdAtIso,
    status,
    priority,
  };

  if (desc !== undefined) normalized.description = desc;
  if (deadlineIso !== undefined) normalized.deadline = deadlineIso;

  return normalized;
}