import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask } from '../api';
import { taskSchema, type TaskFormData } from '../schema';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import './CreateTask.css';

export function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) {
        setError('ID завдання не вказано');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const task = await getTaskById(id);
        reset({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          deadline: task.deadline
            ? new Date(task.deadline).toISOString().split('T')[0]
            : '',
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Помилка завантаження завдання'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, reset]);

  const onSubmit = async (data: TaskFormData) => {
    if (!id) return;

    try {
      await updateTask(id, {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || undefined,
      });
      showToast('Завдання успішно оновлено', 'success');
      navigate(`/tasks/${id}`);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Не вдалося оновити завдання',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="create-task-container">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-task-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/tasks')} className="cancel-btn">
          Повернутися до списку
        </button>
      </div>
    );
  }

  return (
    <div className="create-task-container">
      <h1>Редагувати завдання</h1>
      <div className="form-section">
        <form onSubmit={handleSubmit(onSubmit)} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Назва:</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="title"
                {...register('title')}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && (
                <span className="error-icon">
                  <span className="error-tooltip">{errors.title.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Опис:</label>
            <div className="input-wrapper">
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && (
                <span className="error-icon">
                  <span className="error-tooltip">{errors.description.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Статус:</label>
            <div className="input-wrapper">
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
                <span className="error-icon">
                  <span className="error-tooltip">{errors.status.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Пріоритет:</label>
            <div className="input-wrapper">
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
                <span className="error-icon">
                  <span className="error-tooltip">{errors.priority.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Дедлайн:</label>
            <div className="input-wrapper">
              <input
                type="date"
                id="deadline"
                {...register('deadline')}
                className={errors.deadline ? 'error' : ''}
              />
              {errors.deadline && (
                <span className="error-icon">
                  <span className="error-tooltip">{errors.deadline.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="cancel-btn"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!isValid || !isDirty}
              className="submit-btn"
            >
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
