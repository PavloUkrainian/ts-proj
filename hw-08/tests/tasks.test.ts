// Mock Sequelize module FIRST
jest.mock('sequelize', () => {
  const mockSequelizeInstance = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
  };

  const MockSequelize = jest.fn(() => mockSequelizeInstance);
  (MockSequelize as any).Op = {
    between: Symbol('between'),
  };

  return {
    Sequelize: MockSequelize,
    DataTypes: {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      TEXT: 'TEXT',
      ENUM: jest.fn(() => 'ENUM'),
      DATE: 'DATE',
      NOW: 'NOW',
    },
    Model: class MockModel {},
    Op: {
      between: Symbol('between'),
    },
  };
});

// Mock database config
jest.mock('../src/config/database.js', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
  };
  return {
    sequelize: mockSequelize,
    connectDatabase: jest.fn().mockResolvedValue(undefined),
    syncDatabase: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock Sequelize models
jest.mock('../src/models/Task.model.js', () => {
  const mockModel = jest.fn();
  (mockModel as any).create = jest.fn();
  (mockModel as any).findAll = jest.fn();
  (mockModel as any).findByPk = jest.fn();
  (mockModel as any).destroy = jest.fn();
  (mockModel as any).init = jest.fn();
  (mockModel as any).belongsTo = jest.fn();
  return { Task: mockModel };
});

jest.mock('../src/models/User.model.js', () => {
  const mockModel = jest.fn();
  (mockModel as any).create = jest.fn();
  (mockModel as any).init = jest.fn();
  (mockModel as any).hasMany = jest.fn();
  return { User: mockModel };
});

import request from 'supertest';
import app from '../src/server.js';
import { Task } from '../src/models/Task.model.js';
import { User } from '../src/models/User.model.js';

describe('Tasks API', () => {
  let testUser: any;
  let mockTaskCreate: jest.Mock;
  let mockTaskFindAll: jest.Mock;
  let mockTaskFindByPk: jest.Mock;
  let mockTaskUpdate: jest.Mock;
  let mockTaskDestroy: jest.Mock;
  let mockUserCreate: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock User
    testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserCreate = jest.fn().mockResolvedValue(testUser);
    (User.create as jest.Mock) = mockUserCreate;

    // Mock Task methods
    mockTaskCreate = jest.fn();
    mockTaskFindAll = jest.fn();
    mockTaskFindByPk = jest.fn();
    mockTaskUpdate = jest.fn();
    mockTaskDestroy = jest.fn();

    (Task.create as jest.Mock) = mockTaskCreate;
    (Task.findAll as jest.Mock) = mockTaskFindAll;
    (Task.findByPk as jest.Mock) = mockTaskFindByPk;
    (Task.destroy as jest.Mock) = mockTaskDestroy;
  });

  const createMockTask = (overrides: any = {}) => {
    const task = {
      id: overrides.id || 1,
      title: overrides.title || 'Test Task',
      description: overrides.description || null,
      status: overrides.status || 'todo',
      priority: overrides.priority || 'medium',
      deadline: overrides.deadline || null,
      userId: overrides.userId || testUser.id,
      createdAt: overrides.createdAt || new Date('2024-01-01'),
      updatedAt: overrides.updatedAt || new Date('2024-01-01'),
      toJSON: () => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }),
      update: mockTaskUpdate.mockResolvedValue(undefined),
      destroy: mockTaskDestroy.mockResolvedValue(undefined),
    };
    return task;
  };

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      mockTaskFindAll.mockResolvedValue([]);

      const response = await request(app).get('/tasks').expect(200);

      expect(response.body).toEqual([]);
      expect(mockTaskFindAll).toHaveBeenCalledWith({ where: {} });
    });

    it('should return all tasks', async () => {
      const task1 = createMockTask({
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'low',
      });
      const task2 = createMockTask({
        id: 2,
        title: 'Task 2',
        description: 'Description 2',
        status: 'in_progress',
        priority: 'high',
      });

      mockTaskFindAll.mockResolvedValue([task1, task2]);

      const response = await request(app).get('/tasks').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('1');
      expect(response.body[1].id).toBe('2');
    });

    it('should filter tasks by status', async () => {
      const task1 = createMockTask({
        id: 1,
        title: 'Task 1',
        status: 'todo',
        priority: 'low',
      });

      mockTaskFindAll.mockResolvedValue([task1]);

      const response = await request(app).get('/tasks?status=todo').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
      expect(mockTaskFindAll).toHaveBeenCalledWith({
        where: { status: 'todo' },
      });
    });

    it('should filter tasks by priority', async () => {
      const task2 = createMockTask({
        id: 2,
        title: 'Task 2',
        status: 'todo',
        priority: 'high',
      });

      mockTaskFindAll.mockResolvedValue([task2]);

      const response = await request(app)
        .get('/tasks?priority=high')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].priority).toBe('high');
      expect(mockTaskFindAll).toHaveBeenCalledWith({
        where: { priority: 'high' },
      });
    });

    it('should return 400 for invalid status filter', async () => {
      const response = await request(app)
        .get('/tasks?status=invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid query parameters');
    });

    it('should return 400 for invalid priority filter', async () => {
      const response = await request(app)
        .get('/tasks?priority=invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid query parameters');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return task by id', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const response = await request(app).get('/tasks/1').expect(200);

      expect(response.body.id).toBe('1');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('medium');
    });

    it('should return 404 for non-existent task', async () => {
      mockTaskFindByPk.mockResolvedValue(null);

      const response = await request(app).get('/tasks/99999').expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app).get('/tasks/invalid').expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with all fields', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'in_progress',
        priority: 'high',
        deadline: '2024-12-31T23:59:59.000Z',
        userId: testUser.id,
      };

      const createdTask = createMockTask({
        id: 1,
        ...newTask,
        deadline: new Date(newTask.deadline),
      });

      mockTaskCreate.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.title).toBe('New Task');
      expect(response.body.description).toBe('New Description');
      expect(response.body.status).toBe('in_progress');
      expect(response.body.priority).toBe('high');
      expect(response.body.userId).toBeUndefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should create a new task with minimal fields', async () => {
      const newTask = {
        title: 'Minimal Task',
        userId: testUser.id,
      };

      const createdTask = createMockTask({
        id: 1,
        title: 'Minimal Task',
        description: null,
        status: 'todo',
        priority: 'medium',
        deadline: null,
      });

      mockTaskCreate.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.title).toBe('Minimal Task');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('medium');
      expect(response.body.description).toBeUndefined();
      expect(response.body.deadline).toBeUndefined();
    });

    it('should return 400 for missing title', async () => {
      const newTask = {
        description: 'No title',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for empty title', async () => {
      const newTask = {
        title: '',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for invalid status', async () => {
      const newTask = {
        title: 'Test Task',
        status: 'invalid',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for invalid priority', async () => {
      const newTask = {
        title: 'Test Task',
        priority: 'invalid',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for missing userId', async () => {
      const newTask = {
        title: 'Test Task',
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for invalid userId', async () => {
      const newTask = {
        title: 'Test Task',
        userId: -1,
      };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task with all fields', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        status: 'todo',
        priority: 'low',
      });

      // Update the task object when update is called
      mockTaskUpdate.mockImplementation((updateData: any) => {
        Object.assign(task, {
          title: updateData.title || task.title,
          description:
            updateData.description !== undefined
              ? updateData.description
              : task.description,
          status: updateData.status || task.status,
          priority: updateData.priority || task.priority,
          deadline: updateData.deadline
            ? new Date(updateData.deadline)
            : task.deadline,
        });
        return Promise.resolve(task);
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'done',
        priority: 'high',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.description).toBe('Updated Description');
      expect(response.body.status).toBe('done');
      expect(response.body.priority).toBe('high');
    });

    it('should update task with partial fields', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Original Task',
        status: 'todo',
        priority: 'low',
      });

      // Update the task object when update is called
      mockTaskUpdate.mockImplementation((updateData: any) => {
        Object.assign(task, {
          title: updateData.title !== undefined ? updateData.title : task.title,
          description:
            updateData.description !== undefined
              ? updateData.description
              : task.description,
          status:
            updateData.status !== undefined ? updateData.status : task.status,
          priority:
            updateData.priority !== undefined
              ? updateData.priority
              : task.priority,
          deadline:
            updateData.deadline !== undefined
              ? updateData.deadline
                ? new Date(updateData.deadline)
                : null
              : task.deadline,
        });
        return Promise.resolve(task);
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const updateData = {
        status: 'in_progress',
      };

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Original Task');
      expect(response.body.status).toBe('in_progress');
      expect(response.body.priority).toBe('low');
    });

    it('should return 404 for non-existent task', async () => {
      mockTaskFindByPk.mockResolvedValue(null);

      const updateData = {
        title: 'Updated Task',
      };

      const response = await request(app)
        .put('/tasks/99999')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid status', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const updateData = {
        status: 'invalid',
      };

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for invalid priority', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const updateData = {
        priority: 'invalid',
      };

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for empty title', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
      });

      mockTaskFindByPk.mockResolvedValue(task);

      const updateData = {
        title: '',
      };

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task by id', async () => {
      const task = createMockTask({
        id: 1,
        title: 'Task to Delete',
        status: 'todo',
        priority: 'low',
      });

      mockTaskFindByPk.mockResolvedValue(task);
      mockTaskDestroy.mockResolvedValue(undefined);

      await request(app).delete('/tasks/1').expect(204);

      expect(mockTaskFindByPk).toHaveBeenCalledWith(1);
      expect(mockTaskDestroy).toHaveBeenCalled();
    });

    it('should return 404 for non-existent task', async () => {
      mockTaskFindByPk.mockResolvedValue(null);

      const response = await request(app).delete('/tasks/99999').expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app).delete('/tasks/invalid').expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });
});
