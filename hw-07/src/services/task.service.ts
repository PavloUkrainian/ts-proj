import type { Task, CreateTaskInput, UpdateTaskInput, FilterParams } from '../types/task.types.js';

export class TaskService {
  private tasks: Task[] = [];

  getAll(filters?: FilterParams): Task[] {
    let filteredTasks = [...this.tasks];

    if (filters) {
      if (filters.createdAt) {
        const filterDate = new Date(filters.createdAt).toISOString().split('T')[0];
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
          return taskDate === filterDate;
        });
      }

      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }

      if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
    }

    return filteredTasks;
  }

  getById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  create(input: CreateTaskInput): Task {
    const newTask: Task = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      createdAt: new Date().toISOString(),
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      deadline: input.deadline,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  update(id: string, input: UpdateTaskInput): Task {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const existingTask = this.tasks[taskIndex];
    const updatedTask: Task = {
      ...existingTask,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.deadline !== undefined && { deadline: input.deadline }),
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  delete(id: string): void {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks.splice(taskIndex, 1);
  }

  private generateId(): string {
    const maxId = this.tasks.reduce((max, task) => {
      const taskId = parseInt(task.id, 10);
      return isNaN(taskId) ? max : Math.max(max, taskId);
    }, 0);
    
    return String(maxId + 1);
  }
}

