import type { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { z } from 'zod';
import type { CreateTaskInput, UpdateTaskInput, FilterParams } from '../types/task.types.js';
import { STATUS_VALUES, PRIORITY_VALUES } from '../types/task.types.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(STATUS_VALUES as [string, ...string[]]).optional(),
  priority: z.enum(PRIORITY_VALUES as [string, ...string[]]).optional(),
  deadline: z.string().optional(),
  userId: z.number().int().positive('UserId must be a positive integer'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(STATUS_VALUES as [string, ...string[]]).optional(),
  priority: z.enum(PRIORITY_VALUES as [string, ...string[]]).optional(),
  deadline: z.string().optional(),
});

const filterParamsSchema = z.object({
  createdAt: z.string().optional(),
  status: z.enum(STATUS_VALUES as [string, ...string[]]).optional(),
  priority: z.enum(PRIORITY_VALUES as [string, ...string[]]).optional(),
});

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query;
      
      const validationResult = filterParamsSchema.safeParse(query);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        });
        return;
      }

      const filters: FilterParams = validationResult.data;
      const tasks = await this.taskService.getAll(filters);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = createTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request body',
          details: validationResult.error.errors,
        });
        return;
      }

      const input: CreateTaskInput = validationResult.data;
      const newTask = await this.taskService.create(input);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request body',
          details: validationResult.error.errors,
        });
        return;
      }

      const input: UpdateTaskInput = validationResult.data;
      
      try {
        const updatedTask = await this.taskService.update(id, input);
        res.json(updatedTask);
      } catch (error) {
        if (error instanceof Error && error.message === 'Task not found') {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      try {
        await this.taskService.delete(id);
        res.status(204).send();
      } catch (error) {
        if (error instanceof Error && error.message === 'Task not found') {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };
}
