import { z } from 'zod';

export const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  ageGroup: z.string().min(2).max(50),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
