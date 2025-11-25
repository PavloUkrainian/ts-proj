import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../api';
import type { Task } from '../types';
import './TasksList.css';

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка завантаження завдань');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <>Завантаження...</>;
    }

    if (error) {
      return (
        <>
          <div className="error-message">{error}</div>
          <Link to="/tasks/create" className="create-btn">
            Створити завдання
          </Link>
        </>
      );
    }

    if (tasks.length === 0) {
      return (
        <>
          <div className="empty-state">
            <p>Немає завдань</p>
            <Link to="/tasks/create" className="create-btn">
              Створити завдання
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="tasks-header">
          <h1>Список завдань</h1>
          <Link to="/tasks/create" className="create-btn">
            Створити завдання
          </Link>
        </div>
        <div className="tasks-grid">
          {tasks.map((task) => {
            const taskId = task.id ? String(task.id) : undefined;
            if (!taskId) return null;
            
            return (
              <Link key={taskId} to={`/tasks/${taskId}`} className="task-card">
                <h3>{task.title}</h3>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`status status-${task.status}`}>
                    {task.status === 'todo' && 'To Do'}
                    {task.status === 'in_progress' && 'В процесі'}
                    {task.status === 'done' && 'Виконано'}
                  </span>
                  <span className={`priority priority-${task.priority}`}>
                    {task.priority === 'low' && 'Низький'}
                    {task.priority === 'medium' && 'Середній'}
                    {task.priority === 'high' && 'Високий'}
                  </span>
                </div>
                {task.deadline && (
                  <p className="task-deadline">Дедлайн: {new Date(task.deadline).toLocaleDateString('uk-UA')}</p>
                )}
              </Link>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="tasks-list-container">
      {renderContent()}
    </div>
  );
}
