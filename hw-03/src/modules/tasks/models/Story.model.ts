import { Task } from './Task.model';
import type { ITaskBase, TaskType } from '../task.types';

export class Story extends Task {
  public readonly type: TaskType = 'story';
  public storyPoints?: number;
  public epicId?: string;

  constructor(data: ITaskBase, storyPoints?: number, epicId?: string) {
    super(data);
    this.storyPoints = storyPoints;
    this.epicId = epicId;
  }

  public getTaskInfo(): string {
    return `Story: ${this.title} (ID: ${this.id})
Status: ${this.status}
Priority: ${this.priority}
${this.storyPoints !== undefined ? `Story Points: ${this.storyPoints}` : 'Story Points: Not estimated'}
${this.epicId ? `Epic ID: ${this.epicId}` : 'Epic ID: Not assigned'}
Created: ${this.createdAt}
${this.description ? `Description: ${this.description}` : ''}
${this.deadline ? `Deadline: ${this.deadline}` : ''}`;
  }

  public setStoryPoints(points: number): void {
    this.storyPoints = points;
  }

  public setEpicId(epicId: string): void {
    this.epicId = epicId;
  }

  public toJSON(): ITaskBase & { storyPoints?: number; epicId?: string } {
    return {
      ...super.toJSON(),
      storyPoints: this.storyPoints,
      epicId: this.epicId,
    };
  }
}

