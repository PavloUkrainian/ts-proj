import fs from 'node:fs';
import path from 'node:path';
import { Task, Subtask, Bug, Story, Epic } from './task.types';
import type { ITaskBase, CreateTaskInput, UpdateTaskInput, FilterParams, Status, Priority } from './task.types';
import { validateTaskInput, validateUpdateInput } from './task.validation';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/tasks.json');

type RawTaskData = ITaskBase & {
  parentId?: string | number;
  assignee?: string;
  storyPoints?: number;
  epicId?: string | number;
  features?: string[];
};

function readAllRaw(): RawTaskData[] {
  if (!fs.existsSync(DATA_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(tasks: (Task | Subtask | Bug | Story | Epic)[]): void {
  const raw = tasks.map(task => task.toJSON());
  fs.writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2), 'utf-8');
}

function createTaskInstance(data: RawTaskData): Task | Subtask | Bug | Story | Epic {
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
  private tasks: (Task | Subtask | Bug | Story | Epic)[] = [];

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

  getAll(): (Task | Subtask | Bug | Story | Epic)[] {
    return [...this.tasks];
  }

  getById(id: string | number): Task | Subtask | Bug | Story | Epic | undefined {
    return this.tasks.find(t => String(t.id) === String(id));
  }

  create(input: CreateTaskInput): Task | Subtask | Bug | Story | Epic {
    validateTaskInput(input);

    const tasks = this.getAll();
    const last = tasks.length > 0 ? tasks[tasks.length - 1] : undefined;

    let autoId: string | number = 1;
    if (last) {
      const n = Number(last.id);
      autoId = Number.isFinite(n) ? n + 1 : String(tasks.length + 1);
    }

    const taskType = input.type || 'task';
    const now = new Date().toISOString();

    const taskData: ITaskBase = {
      id: autoId,
      title: input.title.trim(),
      description: input.description?.trim(),
      createdAt: now,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      deadline: input.deadline ? (typeof input.deadline === 'string' ? input.deadline : input.deadline.toISOString()) : undefined,
      type: taskType,
    };

    let newTask: Task | Subtask | Bug | Story | Epic;

    switch (taskType) {
      case 'subtask':
        if (!input.parentId) {
          throw new Error('Subtask requires parentId');
        }
        newTask = new Subtask(taskData, input.parentId);
        break;
      case 'bug':
        newTask = new Bug(taskData, input.assignee);
        break;
      case 'story':
        newTask = new Story(taskData, input.storyPoints, input.epicId);
        break;
      case 'epic':
        newTask = new Epic(taskData, input.features);
        break;
      default:
        newTask = new Task(taskData);
    }

    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
  }

  update(id: string | number, input: UpdateTaskInput): Task | Subtask | Bug | Story | Epic {
    const index = this.tasks.findIndex(t => String(t.id) === String(id));
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
      updatedData.deadline = typeof input.deadline === 'string' 
        ? input.deadline 
        : input.deadline.toISOString();
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

  delete(id: string | number): void {
    const index = this.tasks.findIndex(t => String(t.id) === String(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  filter(params: FilterParams): (Task | Subtask | Bug | Story | Epic)[] {
    return this.tasks.filter(task => {
      if (params.status && task.status !== params.status) return false;
      if (params.priority && task.priority !== params.priority) return false;
      if (params.type && task.type !== params.type) return false;
      
      const created = new Date(task.createdAt);
      if (params.createdFrom) {
        const from = params.createdFrom instanceof Date ? params.createdFrom : new Date(params.createdFrom);
        if (created < from) return false;
      }
      if (params.createdTo) {
        const to = params.createdTo instanceof Date ? params.createdTo : new Date(params.createdTo);
        if (created > to) return false;
      }
      
      return true;
    });
  }

  isCompletedBeforeDeadline(task: Task | Subtask | Bug | Story | Epic, completedAt: string | Date = new Date()): boolean {
    if (!task.deadline) return true;
    const deadline = new Date(task.deadline);
    const completed = completedAt instanceof Date ? completedAt : new Date(completedAt);
    return completed <= deadline;
  }
}


