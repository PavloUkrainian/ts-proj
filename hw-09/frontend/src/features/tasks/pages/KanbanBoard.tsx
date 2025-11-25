import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { getTasks, updateTask } from '../api';
import type { Task } from '../types';
import './KanbanBoard.css';

const STATUS_COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
] as const;

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`task-card ${isDragging ? 'dragging' : ''} priority-${task.priority}`}
    >
      <div
        {...listeners}
        className="drag-handle"
        style={{
          cursor: 'grab',
          padding: '4px 8px',
          display: 'inline-block',
          userSelect: 'none',
          float: 'right',
          marginTop: '-8px',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '18px', color: '#999', lineHeight: '1' }}>
          ⋮⋮
        </span>
      </div>
      <Link
        to={`/tasks/${task.id}`}
        className="task-link"
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <h3>{task.title}</h3>
        {task.description && (
          <p className="task-description">
            {task.description.length > 100
              ? `${task.description.substring(0, 100)}...`
              : task.description}
          </p>
        )}
        <div className="task-meta">
          <span className={`priority priority-${task.priority}`}>
            {task.priority === 'low' && 'Низький'}
            {task.priority === 'medium' && 'Середній'}
            {task.priority === 'high' && 'Високий'}
          </span>
          {task.deadline && (
            <span className="deadline">
              {new Date(task.deadline).toLocaleDateString('uk-UA')}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка завантаження завдань'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) {
      return;
    }

    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка оновлення статусу'
      );
      fetchTasks();
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getActiveTask = () => {
    if (!activeId) return null;
    return tasks.find((t) => t.id === activeId);
  };

  interface ColumnProps {
    column: (typeof STATUS_COLUMNS)[number];
  }

  function Column({ column }: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    const columnTasks = getTasksByStatus(column.id);
    const taskIds = columnTasks.map((t) => t.id!);

    return (
      <div key={column.id} className="kanban-column">
        <div className="column-header">
          <h2>{column.title}</h2>
          <span className="task-count">{columnTasks.length}</span>
        </div>
        <div
          ref={setNodeRef}
          className={`task-list ${isOver ? 'dragging-over' : ''}`}
        >
          <SortableContext
            id={column.id}
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="kanban-container">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchTasks} className="retry-btn">
          Спробувати ще раз
        </button>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h1>Task Tracker</h1>
        <Link to="/tasks/create" className="create-btn">
          + Створити завдання
        </Link>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {STATUS_COLUMNS.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>
        <DragOverlay>
          {activeId
            ? (() => {
                const task = getActiveTask();
                return task ? (
                  <div
                    className={`task-card dragging priority-${task.priority}`}
                  >
                    <h3>{task.title}</h3>
                    {task.description && (
                      <p className="task-description">
                        {task.description.length > 100
                          ? `${task.description.substring(0, 100)}...`
                          : task.description}
                      </p>
                    )}
                  </div>
                ) : null;
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
