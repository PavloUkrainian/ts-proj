import './style.css';
import { createTask, getAllTasks, deleteTask } from './taskApi';
import type { Task } from './taskApi';

// DOM elements
let tasksListEl: HTMLDivElement | null = null;
let taskFormEl: HTMLFormElement | null = null;

/**
 * Форматування дати для відображення
 */
function formatDate(dateString?: string): string {
  if (!dateString) return 'Не вказано';
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Отримання назви статусу українською
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'В процесі',
    done: 'Виконано',
  };
  return statusMap[status] || status;
}

/**
 * Отримання назви пріоритету українською
 */
function getPriorityLabel(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Низький',
    medium: 'Середній',
    high: 'Високий',
  };
  return priorityMap[priority] || priority;
}

/**
 * Відображення списку завдань
 */
function renderTasks(tasks: Task[]): void {
  if (!tasksListEl) {
    console.error('Елемент #tasks-list не знайдено');
    return;
  }

  if (tasks.length === 0) {
    tasksListEl.innerHTML = '<p>Немає завдань</p>';
    return;
  }

  tasksListEl.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-card">
      <h3>${task.title}</h3>
      <p class="task-description">${task.description || 'Без опису'}</p>
      <div class="task-info">
        <span class="task-meta"><strong>Створено:</strong> ${formatDate(task.createdAt)}</span>
        <span class="task-meta"><strong>Статус:</strong> ${getStatusLabel(task.status)}</span>
        <span class="task-meta"><strong>Пріоритет:</strong> ${getPriorityLabel(task.priority)}</span>
        ${task.deadline ? `<span class="task-meta"><strong>Дедлайн:</strong> ${formatDate(task.deadline)}</span>` : ''}
      </div>
      <button class="delete-btn" data-id="${task.id}">Видалити</button>
    </div>
  `
    )
    .join('');

  // Додаємо обробники подій для кнопок видалення
  tasksListEl.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const taskId = (e.target as HTMLButtonElement).dataset.id;
      if (taskId) {
        try {
          console.log('Видалення завдання:', taskId);
          await deleteTask(taskId);
          console.log('Завдання видалено, оновлення списку...');
          await loadAndRenderTasks();
        } catch (error) {
          console.error('Помилка видалення завдання:', error);
          alert('Не вдалося видалити завдання. Переконайтеся, що json-server запущений.');
        }
      }
    });
  });
}

/**
 * Завантаження та відображення завдань
 */
async function loadAndRenderTasks(): Promise<void> {
  if (!tasksListEl) {
    console.error('Елемент #tasks-list не знайдено');
    return;
  }

  try {
    console.log('Запит до API...');
    const tasks = await getAllTasks();
    console.log('Завантажено завдань:', tasks.length, tasks);
    renderTasks(tasks);
  } catch (error) {
    console.error('Помилка завантаження завдань:', error);
    tasksListEl.innerHTML = '<p style="color: red;">Помилка завантаження завдань. Переконайтеся, що json-server запущений на порту 3000.</p>';
  }
}

/**
 * Обробка подання форми
 */
function setupFormHandler(): void {
  if (!taskFormEl) {
    console.error('Елемент #task-form не знайдено');
    return;
  }

  taskFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(taskFormEl);
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as 'todo' | 'in_progress' | 'done';
  const priority = formData.get('priority') as 'low' | 'medium' | 'high';
  const deadline = formData.get('deadline') as string;

  try {
    console.log('Створення завдання...');
    const newTask = await createTask({
      title,
      description: description || undefined,
      status,
      priority,
      deadline: deadline || undefined,
    });
    console.log('Завдання створено:', newTask);

    // Очищаємо форму
    taskFormEl.reset();

    // Оновлюємо список завдань
    console.log('Оновлення списку завдань...');
    await loadAndRenderTasks();
  } catch (error) {
    console.error('Помилка створення завдання:', error);
    alert('Не вдалося створити завдання. Переконайтеся, що json-server запущений.');
  }
  });
}

// Ініціалізація після завантаження DOM
function init(): void {
  // Знаходимо елементи DOM
  tasksListEl = document.querySelector<HTMLDivElement>('#tasks-list');
  taskFormEl = document.querySelector<HTMLFormElement>('#task-form');

  if (!tasksListEl) {
    console.error('Елемент #tasks-list не знайдено в DOM');
    return;
  }

  if (!taskFormEl) {
    console.error('Елемент #task-form не знайдено в DOM');
    return;
  }

  console.log('Елементи DOM знайдено, ініціалізація...');
  
  // Налаштовуємо обробник форми
  setupFormHandler();
  
  // Завантажуємо завдання
  loadAndRenderTasks();
}

// Завантажуємо завдання при завантаженні сторінки
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM завантажено, ініціалізація...');
    init();
  });
} else {
  // DOM вже завантажено
  console.log('DOM вже завантажено, ініціалізація...');
  init();
}
