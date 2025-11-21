import type { Task } from './models/Task.model';
import type { Subtask } from './models/Subtask.model';
import type { Bug } from './models/Bug.model';
import type { Story } from './models/Story.model';
import type { Epic } from './models/Epic.model';

export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type TaskType = 'task' | 'subtask' | 'bug' | 'story' | 'epic';

export type TaskEntity = Task | Subtask | Bug | Story | Epic;

export interface ITaskBase {
  id: string;
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
  deadline?: string;
  type?: TaskType;
  parentId?: string;
  assignee?: string;
  storyPoints?: number;
  epicId?: string;
  features?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string;
  assignee?: string;
  storyPoints?: number;
  features?: string[];
}

export interface FilterParams {
  status?: Status;
  priority?: Priority;
  type?: TaskType;
  createdFrom?: string;
  createdTo?: string;
}
