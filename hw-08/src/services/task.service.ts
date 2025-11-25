import type { Task, CreateTaskInput, UpdateTaskInput, FilterParams, Status, Priority } from '../types/task.types.js';
import { Task as TaskModel } from '../models/Task.model.js';
import { Op, type WhereOptions } from 'sequelize';

const convertToTask = (taskModel: TaskModel): Task => {
  const plain = taskModel.toJSON();
  return {
    id: String(plain.id),
    title: plain.title,
    description: plain.description || undefined,
    createdAt: plain.createdAt as string,
    status: plain.status,
    priority: plain.priority,
    deadline: plain.deadline ? (plain.deadline as string) : undefined,
  };
};

const parseId = (id: string): number => {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid task ID format');
  }
  return parsed;
};

export class TaskService {
  async getAll(filters?: FilterParams): Promise<Task[]> {
    const where: WhereOptions<TaskModel> = {};

    if (filters) {
      if (filters.createdAt) {
        const filterDate = new Date(filters.createdAt);
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
        where.createdAt = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }
    }

    const tasks = await TaskModel.findAll({ where });
    return tasks.map(convertToTask);
  }

  async getById(id: string): Promise<Task | null> {
    const taskId = parseId(id);
    const task = await TaskModel.findByPk(taskId);
    if (!task) {
      return null;
    }
    return convertToTask(task);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const taskData: {
      title: string;
      description: string | null;
      status: Status;
      priority: Priority;
      deadline: Date | null;
      userId: number;
    } = {
      title: input.title,
      description: input.description || null,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      deadline: input.deadline ? new Date(input.deadline) : null,
      userId: input.userId,
    };

    const task = await TaskModel.create(taskData);
    return convertToTask(task);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const taskId = parseId(id);
    const task = await TaskModel.findByPk(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData: Partial<{
      title: string;
      description: string | null;
      status: Status;
      priority: Priority;
      deadline: Date | null;
    }> = {};
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description || null;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }
    if (input.deadline !== undefined) {
      updateData.deadline = input.deadline ? new Date(input.deadline) : null;
    }

    await task.update(updateData);
    return convertToTask(task);
  }

  async delete(id: string): Promise<void> {
    const taskId = parseId(id);
    const task = await TaskModel.findByPk(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    await task.destroy();
  }
}
