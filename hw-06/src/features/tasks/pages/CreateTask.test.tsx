import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateTask } from './CreateTask';
import type React from 'react';

vi.mock('../api');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('кнопка Submit має стан disabled, якщо форма порожня', () => {
    renderWithRouter(<CreateTask />);

    const submitButton = screen.getByRole('button', {
      name: /створити завдання/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('кнопка Submit має стан disabled, якщо форма невалідна', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.type(titleInput, 'Тест');
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', {
      name: /створити завдання/i,
    });
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('кнопка стає enabled, якщо форма валідна', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.type(titleInput, 'Тестове завдання');

    const submitButton = screen.getByRole('button', {
      name: /створити завдання/i,
    });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("при помилках валідації з'являються відповідні error messages", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.type(titleInput, 'Тест');
    await user.clear(titleInput);

    await waitFor(() => {
      expect(
        screen.getByText(/назва завдання обов'язкова/i)
      ).toBeInTheDocument();
    });
  });

  it('показує помилку валідації для дедлайну в минулому', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.type(titleInput, 'Тестове завдання');

    const deadlineInput = screen.getByLabelText(/дедлайн:/i);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    await user.type(deadlineInput, yesterdayString);

    await waitFor(() => {
      expect(
        screen.getByText(/дедлайн не може бути в минулому/i)
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /створити завдання/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
