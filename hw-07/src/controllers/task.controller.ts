import type { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { z } from 'zod';
import type { CreateTaskInput, UpdateTaskInput, FilterParams } from '../types/task.types.js';
import { AppError } from '../utils/AppError.js';

const STATUS_VALUES = ['todo', 'in_progress', 'done'] as const;
const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  deadline: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

const filterParamsSchema = z.object({
  createdAt: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
});

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const query = req.query;
      
      const validationResult = filterParamsSchema.safeParse(query);
      if (!validationResult.success) {
        throw new AppError(400, 'Invalid query parameters', validationResult.error.errors);
      }

      const filters: FilterParams = validationResult.data;
      const tasks = this.taskService.getAll(filters);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const task = this.taskService.getById(id);

      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationResult = createTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw new AppError(400, 'Invalid request body', validationResult.error.errors);
      }

      const input: CreateTaskInput = validationResult.data;
      const newTask = this.taskService.create(input);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      
      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(400, 'Invalid request body', validationResult.error.errors);
      }

      const input: UpdateTaskInput = validationResult.data;
      const updatedTask = this.taskService.update(id, input);
      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.taskService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}



