import type { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { z } from 'zod';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  FilterParams,
  Status,
  Priority,
} from '../types/task.types.js';
import { STATUS_VALUES, PRIORITY_VALUES } from '../types/task.types.js';
import { AppError } from '../utils/AppError.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum([...STATUS_VALUES] as [string, ...string[]]).optional(),
  priority: z.enum([...PRIORITY_VALUES] as [string, ...string[]]).optional(),
  deadline: z.string().optional(),
  userId: z.number().int().positive('UserId must be a positive integer'),
});

const updateTaskSchema = createTaskSchema.omit({ userId: true }).partial();

const filterParamsSchema = z.object({
  createdAt: z.string().optional(),
  status: z.enum([...STATUS_VALUES] as [string, ...string[]]).optional(),
  priority: z.enum([...PRIORITY_VALUES] as [string, ...string[]]).optional(),
});

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query;

      const validationResult = filterParamsSchema.safeParse(query);
      if (!validationResult.success) {
        throw new AppError(
          400,
          'Invalid query parameters',
          validationResult.error.errors
        );
      }

      const filters: FilterParams = {
        ...(validationResult.data.createdAt && {
          createdAt: validationResult.data.createdAt,
        }),
        ...(validationResult.data.status && {
          status: validationResult.data.status as Status,
        }),
        ...(validationResult.data.priority && {
          priority: validationResult.data.priority as Priority,
        }),
      };
      const tasks = await this.taskService.getAll(filters);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getById(id);

      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      res.json(task);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid task ID format'
      ) {
        next(new AppError(400, error.message));
        return;
      }
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validationResult = createTaskSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new AppError(
          400,
          'Invalid request body',
          validationResult.error.errors
        );
      }

      const input: CreateTaskInput = {
        ...validationResult.data,
        status: validationResult.data.status as Status | undefined,
        priority: validationResult.data.priority as Priority | undefined,
      };
      const newTask = await this.taskService.create(input);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          400,
          'Invalid request body',
          validationResult.error.errors
        );
      }

      const input: UpdateTaskInput = {
        ...validationResult.data,
        status: validationResult.data.status as Status | undefined,
        priority: validationResult.data.priority as Priority | undefined,
      };
      const updatedTask = await this.taskService.update(id, input);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        next(new AppError(404, 'Task not found'));
        return;
      }
      if (
        error instanceof Error &&
        error.message === 'Invalid task ID format'
      ) {
        next(new AppError(400, error.message));
        return;
      }
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.taskService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        next(new AppError(404, 'Task not found'));
        return;
      }
      if (
        error instanceof Error &&
        error.message === 'Invalid task ID format'
      ) {
        next(new AppError(400, error.message));
        return;
      }
      next(error);
    }
  };
}
