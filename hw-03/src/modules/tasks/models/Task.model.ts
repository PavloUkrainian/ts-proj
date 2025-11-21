import type { ITaskBase, ITaskInfo, TaskType } from '../task.types';

export class Task implements ITaskBase, ITaskInfo {
  public readonly id: string;
  public title: string;
  public description?: string;
  public readonly createdAt: string;
  public status: ITaskBase['status'];
  public priority: ITaskBase['priority'];
  public deadline?: string;
  public readonly type: TaskType = 'task';

  constructor(data: ITaskBase) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.status = data.status;
    this.priority = data.priority;
    this.deadline = data.deadline;
  }

  public getTaskInfo(): string {
    return `Task: ${this.title} (ID: ${this.id})
Status: ${this.status}
Priority: ${this.priority}
Created: ${this.createdAt}
${this.description ? `Description: ${this.description}` : ''}
${this.deadline ? `Deadline: ${this.deadline}` : ''}`;
  }

  public update(data: Partial<ITaskBase>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.status !== undefined) this.status = data.status;
    if (data.priority !== undefined) this.priority = data.priority;
    if (data.deadline !== undefined) this.deadline = data.deadline;
  }

  public toJSON(): ITaskBase {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      status: this.status,
      priority: this.priority,
      deadline: this.deadline,
      type: this.type,
    };
  }
}

