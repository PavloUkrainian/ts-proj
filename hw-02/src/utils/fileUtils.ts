import fs from 'node:fs';
import path from 'node:path';
import type { Task, RawTask } from '../types';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/tasks.json');

export function readAllRaw(): RawTask[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function writeAll(tasks: Task[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
}

