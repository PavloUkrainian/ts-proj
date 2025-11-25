import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';

const router = Router();
const taskController = new TaskController();

router.get('/tasks', taskController.getAll);
router.get('/tasks/:id', taskController.getById);
router.post('/tasks', taskController.create);
router.put('/tasks/:id', taskController.update);
router.delete('/tasks/:id', taskController.delete);

export default router;
