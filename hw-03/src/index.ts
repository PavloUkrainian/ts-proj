import { TaskController } from './modules/tasks/task.controller';

const controller = new TaskController();

console.log('ALL:', controller.getAll());

console.log('GET 2:', controller.getById('2'));

const created = controller.create({
  title: 'New minimal task',
  description: 'Just demo',
  type: 'task'
});
console.log('CREATED:', created);
console.log('TASK INFO:', controller.getTaskInfo(created));

const updated = controller.update(created.id, { status: 'done' });
console.log('UPDATED:', updated);
console.log('UPDATED TASK INFO:', controller.getTaskInfo(updated));

// Демонстрація різних типів завдань
const bug = controller.create({
  title: 'Fix login button',
  description: 'Login button not working',
  type: 'bug',
  assignee: 'John Doe',
  priority: 'high'
});
console.log('\nBUG INFO:', controller.getTaskInfo(bug));

const story = controller.create({
  title: 'Implement user authentication',
  description: 'Add login and registration',
  type: 'story',
  storyPoints: 5,
  priority: 'high'
});
console.log('\nSTORY INFO:', controller.getTaskInfo(story));

const epic = controller.create({
  title: 'User Management System',
  description: 'Complete user management features',
  type: 'epic',
  features: ['Authentication', 'User Profile', 'Settings']
});
console.log('\nEPIC INFO:', controller.getTaskInfo(epic));

const subtask = controller.create({
  title: 'Add password validation',
  description: 'Validate password strength',
  type: 'subtask',
  parentId: story.id,
  priority: 'medium'
});
console.log('\nSUBTASK INFO:', controller.getTaskInfo(subtask));

const completedAt = '2025-10-19T20:00:00Z';
const result = controller.isCompletedBeforeDeadline(updated, completedAt);
console.log(`\nTask "${updated.title}" completed on time?`, result);

controller.delete(created.id);
console.log('\nDELETED. EXISTS?', controller.getById(created.id));

console.log('\nFILTER status=todo:', controller.filter({ status: 'todo' }));


