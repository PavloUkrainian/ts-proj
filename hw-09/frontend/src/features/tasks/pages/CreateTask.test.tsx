import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateTask } from './CreateTask';
import type React from 'react';

vi.mock('../api');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('показує помилку валідації для назви завдання, що перевищує 200 символів', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    const longTitle = 'a'.repeat(201);
    await user.type(titleInput, longTitle);

    await waitFor(() => {
      expect(
        screen.getByText(/назва завдання не може перевищувати 200 символів/i)
      ).toBeInTheDocument();
    });
  });

  it('показує помилку валідації для опису, що перевищує 1000 символів', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTask />);

    const titleInput = screen.getByLabelText(/назва:/i);
    await user.type(titleInput, 'Тестове завдання');

    const descriptionInput = screen.getByLabelText(/опис:/i);
    const longDescription = 'a'.repeat(1001);
    await user.type(descriptionInput, longDescription);

    await waitFor(() => {
      expect(
        screen.getByText(/опис не може перевищувати 1000 символів/i)
      ).toBeInTheDocument();
    });
  });

  it('кнопка Submit disabled, якщо форма не зазнала змін', () => {
    renderWithRouter(<CreateTask />);

    const submitButton = screen.getByRole('button', {
      name: /створити завдання/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
