import { TaskService } from './task.service';
import type { CreateTaskInput, UpdateTaskInput, FilterParams } from './task.types';
import type { Task, Subtask, Bug, Story, Epic } from './task.types';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService?: TaskService) {
    this.taskService = taskService || new TaskService();
  }

  getAll(): (Task | Subtask | Bug | Story | Epic)[] {
    return this.taskService.getAll();
  }

  getById(id: string | number): Task | Subtask | Bug | Story | Epic | undefined {
    return this.taskService.getById(id);
  }

  create(input: CreateTaskInput): Task | Subtask | Bug | Story | Epic {
    return this.taskService.create(input);
  }

  update(id: string | number, input: UpdateTaskInput): Task | Subtask | Bug | Story | Epic {
    return this.taskService.update(id, input);
  }

  delete(id: string | number): void {
    this.taskService.delete(id);
  }

  filter(params: FilterParams): (Task | Subtask | Bug | Story | Epic)[] {
    return this.taskService.filter(params);
  }

  isCompletedBeforeDeadline(
    task: Task | Subtask | Bug | Story | Epic,
    completedAt?: string | Date
  ): boolean {
    return this.taskService.isCompletedBeforeDeadline(task, completedAt);
  }

  getTaskInfo(task: Task | Subtask | Bug | Story | Epic): string {
    return task.getTaskInfo();
  }
}


