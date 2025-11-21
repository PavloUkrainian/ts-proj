import { Task } from './Task.model';
import type { ITaskBase, TaskType } from '../task.types';

export class Bug extends Task {
  public readonly type: TaskType = 'bug';
  public assignee?: string;

  constructor(data: ITaskBase, assignee?: string) {
    super(data);
    this.assignee = assignee;
  }

  public getTaskInfo(): string {
    return `Bug: ${this.title} (ID: ${this.id})
Status: ${this.status}
Priority: ${this.priority}
${this.assignee ? `Assignee: ${this.assignee}` : 'Assignee: Unassigned'}
Created: ${this.createdAt}
${this.description ? `Description: ${this.description}` : ''}
${this.deadline ? `Deadline: ${this.deadline}` : ''}`;
  }

  public setAssignee(assignee: string): void {
    this.assignee = assignee;
  }

  public toJSON(): ITaskBase & { assignee?: string } {
    return {
      ...super.toJSON(),
      assignee: this.assignee,
    };
  }
}

