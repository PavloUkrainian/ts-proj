import {
  createTask,
  deleteTask,
  filterTasks,
  getById,
  loadAll,
  updateTask,
  isCompletedBeforeDeadline
} from './services/taskService';


console.log('ALL:', loadAll());

console.log('GET 2:', getById('2'));

const created = createTask({
  title: 'New minimal task',
  description: 'Just demo'
});
console.log('CREATED:', created);

const updated = updateTask(created.id, { status: 'done' });
console.log('UPDATED:', updated);

deleteTask(created.id);
console.log('DELETED. EXISTS?', getById(created.id));

console.log('FILTER status=todo:', filterTasks({ status: 'todo' }));

const completedAt = '2025-10-19T20:00:00Z';
const result = isCompletedBeforeDeadline(updated, completedAt);
console.log(updated)
console.log(`Task "${updated.title}" completed on time?`, result);




