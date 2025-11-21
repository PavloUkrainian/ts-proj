import './style.css';
import { createTask, getAllTasks, deleteTask } from './taskApi';
import type { Task, TaskStatus, TaskPriority } from './taskApi';

// Константи для маппінгу статусів та пріоритетів
const STATUS_MAP: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'В процесі',
  done: 'Виконано',
};

const PRIORITY_MAP: Record<TaskPriority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

// DOM elements
let tasksListEl: HTMLDivElement;
let taskFormEl: HTMLFormElement;

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
function getStatusLabel(status: TaskStatus): string {
  return STATUS_MAP[status] || status;
}

/**
 * Отримання назви пріоритету українською
 */
function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_MAP[priority] || priority;
}

/**
 * Відображення списку завдань
 */
function renderTasks(tasks: Task[]): void {
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
}

/**
 * Завантаження та відображення завдань
 */
async function loadAndRenderTasks(): Promise<void> {
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
  taskFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(taskFormEl);
    const data = Object.fromEntries(formData) as {
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      deadline: string;
    };

    try {
      console.log('Створення завдання...');
      const newTask = await createTask({
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || undefined,
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
  tasksListEl = document.querySelector<HTMLDivElement>('#tasks-list') as HTMLDivElement;
  taskFormEl = document.querySelector<HTMLFormElement>('#task-form') as HTMLFormElement;

  console.log('Елементи DOM знайдено, ініціалізація...');
  
  // Налаштовуємо обробник форми
  setupFormHandler();
  
  // Налаштовуємо event delegation для кнопок видалення
  tasksListEl.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('.delete-btn')) {
      const taskId = target.dataset.id;
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
    }
  });
  
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
