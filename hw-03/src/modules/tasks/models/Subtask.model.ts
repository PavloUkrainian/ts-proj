import { Task } from './Task.model';
import type { ITaskBase, TaskType } from '../task.types';

export class Subtask extends Task {
  public readonly type: TaskType = 'subtask';
  public parentId: string;

  constructor(data: ITaskBase, parentId: string) {
    super(data);
    this.parentId = parentId;
  }

  public getTaskInfo(): string {
    return `Subtask: ${this.title} (ID: ${this.id})
Parent Task ID: ${this.parentId}
Status: ${this.status}
Priority: ${this.priority}
Created: ${this.createdAt}
${this.description ? `Description: ${this.description}` : ''}
${this.deadline ? `Deadline: ${this.deadline}` : ''}`;
  }

  public toJSON(): ITaskBase & { parentId: string } {
    return {
      ...super.toJSON(),
      parentId: this.parentId,
    };
  }
}

