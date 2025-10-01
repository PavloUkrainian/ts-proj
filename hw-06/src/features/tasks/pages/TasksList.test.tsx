import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TasksList } from './TasksList';
import * as api from '../api';
import type { Task } from '../types';
import type React from 'react';

vi.mock('../api');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TasksList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('відображає елементи у списку коректно (усі потрібні поля присутні)', async () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Тестове завдання 1',
        description: 'Опис завдання 1',
        status: 'todo',
        priority: 'high',
        deadline: '2025-12-31',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Тестове завдання 2',
        description: 'Опис завдання 2',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    ];

    vi.mocked(api.getTasks).mockResolvedValue(mockTasks);

    renderWithRouter(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText('Тестове завдання 1')).toBeInTheDocument();
      expect(screen.getByText('Тестове завдання 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Опис завдання 1')).toBeInTheDocument();
    expect(screen.getByText('Опис завдання 2')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('В процесі')).toBeInTheDocument();
    expect(screen.getByText('Високий')).toBeInTheDocument();
    expect(screen.getByText('Середній')).toBeInTheDocument();
  });

  it('відображає empty state при порожньому списку', async () => {
    vi.mocked(api.getTasks).mockResolvedValue([]);

    renderWithRouter(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText('Немає завдань')).toBeInTheDocument();
    });

    expect(screen.getByText('Створити завдання')).toBeInTheDocument();
  });

  it('показує error message при помилці', async () => {
    const errorMessage = 'Помилка завантаження завдань';
    vi.mocked(api.getTasks).mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('Створити завдання')).toBeInTheDocument();
  });
});
