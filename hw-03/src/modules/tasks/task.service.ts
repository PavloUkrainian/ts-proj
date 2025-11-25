import fs from 'node:fs';
import path from 'node:path';
import { Task } from './models/Task.model';
import { Subtask } from './models/Subtask.model';
import { Bug } from './models/Bug.model';
import { Story } from './models/Story.model';
import { Epic } from './models/Epic.model';
import type { ITaskBase, CreateTaskInput, UpdateTaskInput, FilterParams, TaskEntity } from './task.types';
import { validateTaskInput, validateUpdateInput } from './task.validation';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/tasks.json');

type RawTaskData = ITaskBase & {
  parentId?: string;
  assignee?: string;
  storyPoints?: number;
  epicId?: string;
  features?: string[];
};

function readAllRaw(): RawTaskData[] {
  if (!fs.existsSync(DATA_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(tasks: TaskEntity[]): void {
  const raw = tasks.map(task => task.toJSON());
  fs.writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2), 'utf-8');
}

function createTaskInstance(data: RawTaskData): TaskEntity {
  const taskType = data.type || 'task';
  
  const taskData: ITaskBase = {
    id: data.id,
    title: data.title,
    description: data.description,
    createdAt: data.createdAt,
    status: data.status,
    priority: data.priority,
    deadline: data.deadline,
    type: taskType,
  };

  switch (taskType) {
    case 'subtask':
      if (data.parentId === undefined) {
        throw new Error('Subtask requires parentId');
      }
      return new Subtask(taskData, data.parentId);
    case 'bug':
      return new Bug(taskData, data.assignee);
    case 'story':
      return new Story(taskData, data.storyPoints, data.epicId);
    case 'epic':
      return new Epic(taskData, data.features || []);
    default:
      return new Task(taskData);
  }
}

export class TaskService {
  private tasks: TaskEntity[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    const raw = readAllRaw();
    this.tasks = raw.map(data => createTaskInstance(data));
  }

  private saveTasks(): void {
    writeAll(this.tasks);
  }

  getAll(): TaskEntity[] {
    return [...this.tasks];
  }

  getById(id: string): TaskEntity | undefined {
    return this.tasks.find(t => t.id === id);
  }

  create(input: CreateTaskInput): TaskEntity {
    validateTaskInput(input);

    const tasks = this.getAll();
    const last = tasks.length > 0 ? tasks[tasks.length - 1] : undefined;

    let autoId: string = '1';
    if (last) {
      const n = Number.parseInt(last.id, 10);
      autoId = Number.isFinite(n) ? String(n + 1) : String(tasks.length + 1);
    }

    const taskType = input.type || 'task';
    const now = new Date().toISOString();

    const taskData: RawTaskData = {
      id: autoId,
      title: input.title.trim(),
      description: input.description?.trim(),
      createdAt: now,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      deadline: input.deadline || undefined,
      type: taskType,
      parentId: input.parentId,
      assignee: input.assignee,
      storyPoints: input.storyPoints,
      epicId: input.epicId,
      features: input.features,
    };

    const newTask = createTaskInstance(taskData);

    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
  }

  update(id: string, input: UpdateTaskInput): TaskEntity {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }

    const existingTask = this.tasks[index];
    validateUpdateInput(input, existingTask);

    const updatedData: Partial<ITaskBase> = {};
    if (input.title !== undefined) updatedData.title = input.title.trim();
    if (input.description !== undefined) updatedData.description = input.description?.trim();
    if (input.status !== undefined) updatedData.status = input.status;
    if (input.priority !== undefined) updatedData.priority = input.priority;
    if (input.deadline !== undefined) {
      updatedData.deadline = input.deadline;
    }

    existingTask.update(updatedData);

    if (input.assignee !== undefined && existingTask instanceof Bug) {
      existingTask.setAssignee(input.assignee);
    }
    if (input.storyPoints !== undefined && existingTask instanceof Story) {
      existingTask.setStoryPoints(input.storyPoints);
    }
    if (input.features !== undefined && existingTask instanceof Epic) {
      existingTask.setFeatures(input.features);
    }

    this.saveTasks();
    return existingTask;
  }

  delete(id: string): void {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  filter(params: FilterParams): TaskEntity[] {
    return this.tasks.filter(task => {
      if (params.status && task.status !== params.status) return false;
      if (params.priority && task.priority !== params.priority) return false;
      if (params.type && task.type !== params.type) return false;
      
      const created = new Date(task.createdAt);
      if (params.createdFrom) {
        const from = new Date(params.createdFrom);
        if (created < from) return false;
      }
      if (params.createdTo) {
        const to = new Date(params.createdTo);
        if (created > to) return false;
      }
      
      return true;
    });
  }

  isCompletedBeforeDeadline(task: TaskEntity, completedAt: string = new Date().toISOString()): boolean {
    if (!task.deadline) return true;
    const deadline = new Date(task.deadline);
    const completed = new Date(completedAt);
    return completed <= deadline;
  }
}
