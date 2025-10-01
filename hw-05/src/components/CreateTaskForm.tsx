import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTask } from '../taskApi';
import './CreateTaskForm.css';

const taskSchema = z.object({
  title: z.string().min(1, 'Назва завдання обов\'язкова'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done'], {
    required_error: 'Статус обов\'язковий',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Пріоритет обов\'язковий',
  }),
  deadline: z.string().optional().refine(
    (date) => {
      if (!date) return true;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    {
      message: 'Дедлайн не може бути в минулому',
    }
  ),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskFormProps {
  onTaskCreated?: () => void;
}

export function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
      });
      reset();
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Помилка створення завдання:', error);
      alert('Не вдалося створити завдання');
    }
  };

  return (
    <div className="form-section">
      <h2>Створити нове завдання</h2>
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
            <span className="error-message">{errors.description.message}</span>
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
            <option value="in_progress">В процесі</option>
            <option value="done">Виконано</option>
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

        <button type="submit" disabled={!isValid} className="submit-btn">
          Створити завдання
        </button>
      </form>
    </div>
  );
}

