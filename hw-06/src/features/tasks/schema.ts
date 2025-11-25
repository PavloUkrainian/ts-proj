import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Назва завдання обов\'язкова'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
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

export type TaskFormData = z.infer<typeof taskSchema>;

