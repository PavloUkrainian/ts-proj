import type { CreateTaskInput, UpdateTaskInput, ITaskBase } from './task.types';

export function validateTaskInput(input: CreateTaskInput): void {
  if (!input.title || typeof input.title !== 'string' || input.title.trim() === '') {
    throw new Error('Task title is required and cannot be empty');
  }

  if (input.description !== undefined && (typeof input.description !== 'string' || input.description.trim() === '')) {
    throw new Error('Task description cannot be an empty string');
  }

  if (input.status && !['todo', 'in_progress', 'done'].includes(input.status)) {
    throw new Error('Invalid status. Must be one of: todo, in_progress, done');
  }

  if (input.priority && !['low', 'medium', 'high'].includes(input.priority)) {
    throw new Error('Invalid priority. Must be one of: low, medium, high');
  }

  if (input.deadline) {
    const deadline = new Date(input.deadline);
    if (isNaN(deadline.getTime())) {
      throw new Error('Invalid deadline date');
    }
  }

  if (input.type && !['task', 'subtask', 'bug', 'story', 'epic'].includes(input.type)) {
    throw new Error('Invalid task type');
  }

  if (input.type === 'subtask' && !input.parentId) {
    throw new Error('Subtask requires parentId');
  }

  if (input.parentId !== undefined && (input.parentId === null || input.parentId === '')) {
    throw new Error('Parent ID cannot be empty');
  }

  if (input.assignee !== undefined && (typeof input.assignee !== 'string' || input.assignee.trim() === '')) {
    throw new Error('Assignee cannot be empty');
  }

  if (input.storyPoints !== undefined) {
    if (typeof input.storyPoints !== 'number' || input.storyPoints < 0 || !Number.isInteger(input.storyPoints)) {
      throw new Error('Story points must be a non-negative integer');
    }
  }

  if (input.epicId !== undefined && (input.epicId === null || input.epicId === '')) {
    throw new Error('Epic ID cannot be empty');
  }

  if (input.features !== undefined) {
    if (!Array.isArray(input.features)) {
      throw new Error('Features must be an array');
    }
    if (input.features.some(f => typeof f !== 'string' || f.trim() === '')) {
      throw new Error('All features must be non-empty strings');
    }
  }
}

export function validateUpdateInput(input: UpdateTaskInput, existingTask: ITaskBase): void {
  if (input.title !== undefined && (typeof input.title !== 'string' || input.title.trim() === '')) {
    throw new Error('Task title cannot be empty');
  }

  if (input.description !== undefined && (typeof input.description !== 'string' || input.description.trim() === '')) {
    throw new Error('Task description cannot be an empty string');
  }

  if (input.status && !['todo', 'in_progress', 'done'].includes(input.status)) {
    throw new Error('Invalid status. Must be one of: todo, in_progress, done');
  }

  if (input.priority && !['low', 'medium', 'high'].includes(input.priority)) {
    throw new Error('Invalid priority. Must be one of: low, medium, high');
  }

  if (input.deadline) {
    const deadline = new Date(input.deadline);
    if (isNaN(deadline.getTime())) {
      throw new Error('Invalid deadline date');
    }
  }

  if (input.assignee !== undefined && (typeof input.assignee !== 'string' || input.assignee.trim() === '')) {
    throw new Error('Assignee cannot be empty');
  }

  if (input.storyPoints !== undefined) {
    if (typeof input.storyPoints !== 'number' || input.storyPoints < 0 || !Number.isInteger(input.storyPoints)) {
      throw new Error('Story points must be a non-negative integer');
    }
  }

  if (input.features !== undefined) {
    if (!Array.isArray(input.features)) {
      throw new Error('Features must be an array');
    }
    if (input.features.some(f => typeof f !== 'string' || f.trim() === '')) {
      throw new Error('All features must be non-empty strings');
    }
  }
}
