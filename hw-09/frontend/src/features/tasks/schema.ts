import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Назва завдання обов'язкова")
    .max(200, 'Назва завдання не може перевищувати 200 символів'),
  description: z
    .string()
    .max(1000, 'Опис не може перевищувати 1000 символів')
    .optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z
    .string()
    .optional()
    .refine(
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
