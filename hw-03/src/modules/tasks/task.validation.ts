import type { CreateTaskInput, UpdateTaskInput, ITaskBase, Status, Priority } from './task.types';

const VALID_STATUSES: Status[] = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const VALID_TASK_TYPES = ['task', 'subtask', 'bug', 'story', 'epic'] as const;

function validateStatus(status: string | undefined): void {
  if (status && !VALID_STATUSES.includes(status as Status)) {
    throw new Error('Invalid status. Must be one of: todo, in_progress, done');
  }
}

function validatePriority(priority: string | undefined): void {
  if (priority && !VALID_PRIORITIES.includes(priority as Priority)) {
    throw new Error('Invalid priority. Must be one of: low, medium, high');
  }
}

function validateDeadline(deadline: string | undefined): void {
  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Invalid deadline date');
    }
  }
}

function validateAssignee(assignee: string | undefined): void {
  if (assignee !== undefined && (typeof assignee !== 'string' || assignee.trim() === '')) {
    throw new Error('Assignee cannot be empty');
  }
}

function validateStoryPoints(storyPoints: number | undefined): void {
  if (storyPoints !== undefined) {
    if (typeof storyPoints !== 'number' || storyPoints < 0 || !Number.isInteger(storyPoints)) {
      throw new Error('Story points must be a non-negative integer');
    }
  }
}

function validateFeatures(features: string[] | undefined): void {
  if (features !== undefined) {
    if (!Array.isArray(features)) {
      throw new Error('Features must be an array');
    }
    if (features.some(f => typeof f !== 'string' || f.trim() === '')) {
      throw new Error('All features must be non-empty strings');
    }
  }
}

function validateTitle(title: string | undefined, required: boolean = false): void {
  if (required) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Task title is required and cannot be empty');
    }
  } else {
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      throw new Error('Task title cannot be empty');
    }
  }
}

function validateDescription(description: string | undefined): void {
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    throw new Error('Task description cannot be an empty string');
  }
}

export function validateTaskInput(input: CreateTaskInput): void {
  validateTitle(input.title, true);
  validateDescription(input.description);

  validateStatus(input.status);
  validatePriority(input.priority);
  validateDeadline(input.deadline);

  if (input.type && !VALID_TASK_TYPES.includes(input.type)) {
    throw new Error('Invalid task type');
  }

  if (input.type === 'subtask' && !input.parentId) {
    throw new Error('Subtask requires parentId');
  }

  if (input.parentId !== undefined && (input.parentId === null || input.parentId === '')) {
    throw new Error('Parent ID cannot be empty');
  }

  validateAssignee(input.assignee);

  validateStoryPoints(input.storyPoints);

  if (input.epicId !== undefined && (input.epicId === null || input.epicId === '')) {
    throw new Error('Epic ID cannot be empty');
  }

  validateFeatures(input.features);
}

export function validateUpdateInput(input: UpdateTaskInput, existingTask: ITaskBase): void {
  validateTitle(input.title, false);
  validateDescription(input.description);

  validateStatus(input.status);
  validatePriority(input.priority);
  validateDeadline(input.deadline);
  validateAssignee(input.assignee);
  validateStoryPoints(input.storyPoints);
  validateFeatures(input.features);
}
