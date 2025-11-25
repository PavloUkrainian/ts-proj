import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TaskDetails } from './TaskDetails';
import * as api from '../api';
import type { Task } from '../types';
import type React from 'react';

vi.mock('../api');

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: '1' }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TaskDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('відображає стан завантаження', () => {
    vi.mocked(api.getTaskById).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<TaskDetails />);

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('відображає деталі завдання коректно (усі потрібні поля присутні)', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Тестове завдання',
      description: 'Опис завдання',
      status: 'in_progress',
      priority: 'high',
      deadline: '2025-12-31',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    vi.mocked(api.getTaskById).mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetails />);

    await waitFor(() => {
      expect(screen.getByText('Тестове завдання')).toBeInTheDocument();
    });

    expect(screen.getByText('Опис завдання')).toBeInTheDocument();
    expect(screen.getByText('В процесі')).toBeInTheDocument();
    expect(screen.getByText('Високий')).toBeInTheDocument();
    expect(screen.getByText('Дедлайн')).toBeInTheDocument();
    expect(screen.getByText('Дата створення')).toBeInTheDocument();
  });

  it('відображає завдання без опису та дедлайну', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Мінімальне завдання',
      status: 'todo',
      priority: 'low',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    vi.mocked(api.getTaskById).mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetails />);

    await waitFor(() => {
      expect(screen.getByText('Мінімальне завдання')).toBeInTheDocument();
    });

    expect(screen.queryByText('Опис')).not.toBeInTheDocument();
    expect(screen.queryByText('Дедлайн')).not.toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Низький')).toBeInTheDocument();
  });

  it('показує error message при помилці завантаження', async () => {
    const errorMessage = 'Помилка завантаження завдання';
    vi.mocked(api.getTaskById).mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<TaskDetails />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('Повернутися до списку')).toBeInTheDocument();
  });

  it('показує повідомлення про відсутність завдання', async () => {
    vi.mocked(api.getTaskById).mockRejectedValue(new Error('Task not found'));

    renderWithRouter(<TaskDetails />);

    await waitFor(() => {
      expect(screen.getByText('Task not found')).toBeInTheDocument();
    });
  });

  it('показує повідомлення коли ID не вказано', async () => {
    mockUseParams.mockReturnValue({ id: undefined as unknown as string });

    renderWithRouter(<TaskDetails />);

    await waitFor(() => {
      expect(screen.getByText('ID завдання не вказано')).toBeInTheDocument();
    });

    // Reset for other tests
    mockUseParams.mockReturnValue({ id: '1' });
  });
});

