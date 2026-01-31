import { LessonStatus } from '@prisma/client';

export interface LessonInput {
  title: string;
  content: string;
  ageGroup: string;
}

export interface LessonOutputResponse {
  id: string;
  story: string;
  questions: Record<string, unknown>;
  experiment: Record<string, unknown>;
  createdAt: Date;
}

export interface LessonResponse {
  id: string;
  title: string;
  content: string;
  ageGroup: string;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
  output?: LessonOutputResponse;
}
