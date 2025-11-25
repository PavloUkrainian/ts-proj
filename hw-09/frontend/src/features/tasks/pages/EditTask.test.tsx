import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EditTask } from './EditTask';
import type React from 'react';
import * as api from '../api';

vi.mock('../api');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
  };
});

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo' as const,
  priority: 'medium' as const,
  deadline: '2024-12-31',
  createdAt: '2024-01-01',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EditTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTaskById).mockResolvedValue(mockTask);
  });

  it('завантажує дані задачі при монтуванні', async () => {
    renderWithRouter(<EditTask />);

    await waitFor(() => {
      expect(api.getTaskById).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/назва:/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Test Task');
    });
  });

  it('початкові значення інпутів відповідають даним задачі', async () => {
    renderWithRouter(<EditTask />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/назва:/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /опис:/i
      ) as HTMLTextAreaElement;
      const statusSelect = screen.getByLabelText(
        /статус:/i
      ) as HTMLSelectElement;
      const prioritySelect = screen.getByLabelText(
        /пріоритет:/i
      ) as HTMLSelectElement;

      expect(titleInput.value).toBe('Test Task');
      expect(descriptionInput.value).toBe('Test Description');
      expect(statusSelect.value).toBe('todo');
      expect(prioritySelect.value).toBe('medium');
    });
  });

  it('кнопка Submit має стан disabled, якщо форма невалідна', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditTask />);

    await waitFor(() => {
      expect(screen.getByLabelText(/назва:/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', {
      name: /зберегти зміни/i,
    });
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('кнопка Submit має стан disabled, якщо форма не зазнала змін', async () => {
    renderWithRouter(<EditTask />);

    await waitFor(() => {
      expect(screen.getByLabelText(/назва:/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /зберегти зміни/i,
    });
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("при помилках валідації з'являються відповідні error messages", async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditTask />);

    await waitFor(() => {
      expect(screen.getByLabelText(/назва:/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.clear(titleInput);

    await waitFor(() => {
      expect(
        screen.getByText(/назва завдання обов'язкова/i)
      ).toBeInTheDocument();
    });
  });
});
