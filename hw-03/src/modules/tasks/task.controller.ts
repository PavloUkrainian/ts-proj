import { TaskService } from './task.service';
import type { CreateTaskInput, UpdateTaskInput, FilterParams, TaskEntity } from './task.types';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService?: TaskService) {
    this.taskService = taskService || new TaskService();
  }

  getAll(): TaskEntity[] {
    return this.taskService.getAll();
  }

  getById(id: string): TaskEntity | undefined {
    return this.taskService.getById(id);
  }

  create(input: CreateTaskInput): TaskEntity {
    return this.taskService.create(input);
  }

  update(id: string, input: UpdateTaskInput): TaskEntity {
    return this.taskService.update(id, input);
  }

  delete(id: string): void {
    this.taskService.delete(id);
  }

  filter(params: FilterParams): TaskEntity[] {
    return this.taskService.filter(params);
  }

  isCompletedBeforeDeadline(
    task: TaskEntity,
    completedAt?: string
  ): boolean {
    return this.taskService.isCompletedBeforeDeadline(task, completedAt);
  }

  getTaskInfo(task: TaskEntity): string {
    return task.getTaskInfo();
  }
}
