import request from 'supertest';
import app from '../src/server.js';
import { User } from '../src/models/User.model.js';
import { Task } from '../src/models/Task.model.js';

describe('Tasks API', () => {
  let testUser: User;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      const task1 = await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const task2 = await Task.create({
        title: 'Task 2',
        description: 'Description 2',
        status: 'in_progress',
        priority: 'high',
        userId: testUser.id,
      });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(String(task1.id));
      expect(response.body[1].id).toBe(String(task2.id));
    });

    it('should filter tasks by status', async () => {
      await Task.create({
        title: 'Task 1',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      await Task.create({
        title: 'Task 2',
        status: 'done',
        priority: 'high',
        userId: testUser.id,
      });

      const response = await request(app)
        .get('/tasks?status=todo')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });

    it('should filter tasks by priority', async () => {
      await Task.create({
        title: 'Task 1',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      await Task.create({
        title: 'Task 2',
        status: 'todo',
        priority: 'high',
        userId: testUser.id,
      });

      const response = await request(app)
        .get('/tasks?priority=high')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].priority).toBe('high');
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
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        userId: testUser.id,
      });

      const response = await request(app)
        .get(`/tasks/${task.id}`)
        .expect(200);

      expect(response.body.id).toBe(String(task.id));
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('medium');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app)
        .get('/tasks/invalid')
        .expect(404);

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
      const task = await Task.create({
        title: 'Original Task',
        description: 'Original Description',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'done',
        priority: 'high',
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.description).toBe('Updated Description');
      expect(response.body.status).toBe('done');
      expect(response.body.priority).toBe('high');
    });

    it('should update task with partial fields', async () => {
      const task = await Task.create({
        title: 'Original Task',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const updateData = {
        status: 'in_progress',
      };

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Original Task');
      expect(response.body.status).toBe('in_progress');
      expect(response.body.priority).toBe('low');
    });

    it('should return 404 for non-existent task', async () => {
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
      const task = await Task.create({
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const updateData = {
        status: 'invalid',
      };

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for invalid priority', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const updateData = {
        priority: 'invalid',
      };

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });

    it('should return 400 for empty title', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      const updateData = {
        title: '',
      };

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task by id', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        status: 'todo',
        priority: 'low',
        userId: testUser.id,
      });

      await request(app)
        .delete(`/tasks/${task.id}`)
        .expect(204);

      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app)
        .delete('/tasks/invalid')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });
});

