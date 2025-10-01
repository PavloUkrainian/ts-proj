export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type TaskType = 'task' | 'subtask' | 'bug' | 'story' | 'epic';

export interface ITaskBase {
  id: string | number;
  title: string;
  description?: string;
  createdAt: string;
  status: Status;
  priority: Priority;
  deadline?: string;
  type: TaskType;
}

export interface ITaskInfo {
  getTaskInfo(): string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string | Date;
  type?: TaskType;
  parentId?: string | number; // для Subtask
  assignee?: string; // для Bug
  storyPoints?: number; // для Story
  epicId?: string | number; // для Story
  features?: string[]; // для Epic
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string | Date;
  assignee?: string;
  storyPoints?: number;
  features?: string[];
}

export interface FilterParams {
  status?: Status;
  priority?: Priority;
  type?: TaskType;
  createdFrom?: string | Date;
  createdTo?: string | Date;
}

export class Task implements ITaskBase, ITaskInfo {
  public readonly id: string | number;
  public title: string;
  public description?: string;
  public readonly createdAt: string;
  public status: Status;
  public priority: Priority;
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

export class Subtask extends Task {
  public readonly type: TaskType = 'subtask';
  public parentId: string | number;

  constructor(data: ITaskBase, parentId: string | number) {
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

  public toJSON(): ITaskBase & { parentId: string | number } {
    return {
      ...super.toJSON(),
      parentId: this.parentId,
    };
  }
}

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

export class Story extends Task {
  public readonly type: TaskType = 'story';
  public storyPoints?: number;
  public epicId?: string | number;

  constructor(data: ITaskBase, storyPoints?: number, epicId?: string | number) {
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

  public setEpicId(epicId: string | number): void {
    this.epicId = epicId;
  }

  public toJSON(): ITaskBase & { storyPoints?: number; epicId?: string | number } {
    return {
      ...super.toJSON(),
      storyPoints: this.storyPoints,
      epicId: this.epicId,
    };
  }
}

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


