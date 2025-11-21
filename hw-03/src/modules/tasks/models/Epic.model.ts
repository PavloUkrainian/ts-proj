import { Task } from './Task.model';
import type { ITaskBase, TaskType } from '../task.types';

export class Epic extends Task {
  public readonly type: TaskType = 'epic';
  public features: string[];

  constructor(data: ITaskBase, features: string[] = []) {
    super(data);
    this.features = features;
  }

  public getTaskInfo(): string {
    return `Epic: ${this.title} (ID: ${this.id})
Status: ${this.status}
Priority: ${this.priority}
Features: ${this.features.length > 0 ? this.features.join(', ') : 'No features defined'}
Created: ${this.createdAt}
${this.description ? `Description: ${this.description}` : ''}
${this.deadline ? `Deadline: ${this.deadline}` : ''}`;
  }

  public setFeatures(features: string[]): void {
    this.features = features;
  }

  public addFeature(feature: string): void {
    if (!this.features.includes(feature)) {
      this.features.push(feature);
    }
  }

  public removeFeature(feature: string): void {
    this.features = this.features.filter(f => f !== feature);
  }

  public toJSON(): ITaskBase & { features: string[] } {
    return {
      ...super.toJSON(),
      features: this.features,
    };
  }
}

