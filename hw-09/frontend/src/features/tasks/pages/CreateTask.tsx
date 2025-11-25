import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api';
import { taskSchema, type TaskFormData } from '../schema';
import './CreateTask.css';

const DEFAULT_USER_ID = 1;

export function CreateTask() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'todo',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask({
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || undefined,
        userId: DEFAULT_USER_ID,
      });
      reset();
      navigate('/tasks');
    } catch {
      alert('Не вдалося створити завдання');
    }
  };

  return (
    <div className="create-task-container">
      <h1>Створити нове завдання</h1>
      <div className="form-section">
        <form onSubmit={handleSubmit(onSubmit)} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Назва:</label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && (
              <span className="error-message">{errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Опис:</label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="error-message">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Статус:</label>
            <select
              id="status"
              {...register('status')}
              className={errors.status ? 'error' : ''}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            {errors.status && (
              <span className="error-message">{errors.status.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Пріоритет:</label>
            <select
              id="priority"
              {...register('priority')}
              className={errors.priority ? 'error' : ''}
            >
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
            </select>
            {errors.priority && (
              <span className="error-message">{errors.priority.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Дедлайн:</label>
            <input
              type="date"
              id="deadline"
              {...register('deadline')}
              className={errors.deadline ? 'error' : ''}
            />
            {errors.deadline && (
              <span className="error-message">{errors.deadline.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="cancel-btn"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!isValid || !isDirty}
              className="submit-btn"
            >
              Створити завдання
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
