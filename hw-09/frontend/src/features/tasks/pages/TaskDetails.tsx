import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTaskById, deleteTask } from '../api';
import type { Task } from '../types';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import { ConfirmDialog, useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import './TaskDetails.css';

export function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastContext();
  const {
    isOpen: isConfirmOpen,
    message: confirmMessage,
    showConfirm,
    handleConfirm,
    handleCancel,
  } = useConfirmDialog();

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
        const fetchedTask = await getTaskById(id);
        setTask(fetchedTask);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Помилка завантаження завдання'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleDeleteClick = () => {
    if (!id) return;
    showConfirm('Ви впевнені, що хочете видалити це завдання?', async () => {
      try {
        await deleteTask(id);
        showToast('Завдання успішно видалено', 'success');
        navigate('/tasks');
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Не вдалося видалити завдання',
          'error'
        );
      }
    });
  };

  const renderContent = () => {
    if (loading) {
      return <>Завантаження...</>;
    }

    if (error || !task) {
      return (
        <>
          <div className="error-message">{error || 'Завдання не знайдено'}</div>
          <button onClick={() => navigate('/tasks')} className="back-btn">
            Повернутися до списку
          </button>
        </>
      );
    }

    return (
      <>
        <div className="task-actions">
          <button onClick={() => navigate('/tasks')} className="back-btn">
            ← Назад до списку
          </button>
          <div className="action-buttons">
            <Link to={`/tasks/${task.id}/edit`} className="edit-btn">
              Редагувати
            </Link>
            <button onClick={handleDeleteClick} className="delete-btn">
              Видалити
            </button>
          </div>
        </div>
        <div className="task-details">
          <h1>{task.title}</h1>
          {task.description && (
            <div className="task-section">
              <h2>Опис</h2>
              <p>{task.description}</p>
            </div>
          )}
          <div className="task-section">
            <h2>Статус</h2>
            <span className={`status status-${task.status}`}>
              {task.status === 'todo' && 'To Do'}
              {task.status === 'in_progress' && 'In Progress'}
              {task.status === 'review' && 'Review'}
              {task.status === 'done' && 'Done'}
            </span>
          </div>
          <div className="task-section">
            <h2>Пріоритет</h2>
            <span className={`priority priority-${task.priority}`}>
              {task.priority === 'low' && 'Низький'}
              {task.priority === 'medium' && 'Середній'}
              {task.priority === 'high' && 'Високий'}
            </span>
          </div>
          {task.deadline && (
            <div className="task-section">
              <h2>Дедлайн</h2>
              <p>{new Date(task.deadline).toLocaleDateString('uk-UA')}</p>
            </div>
          )}
          {task.createdAt && (
            <div className="task-section">
              <h2>Дата створення</h2>
              <p>{new Date(task.createdAt).toLocaleDateString('uk-UA')}</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="task-details-container">{renderContent()}</div>
      {isConfirmOpen && (
        <ConfirmDialog
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
