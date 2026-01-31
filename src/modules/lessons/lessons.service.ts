import { lessonsRepository } from './lessons.repository.js';
import { taskQueue } from '../../lib/queue.js';
import { tasksRepository } from '../tasks/tasks.repository.js';
import { logger } from '../../lib/logger.js';
import type { LessonInput, LessonResponse } from './lessons.types.js';

export const lessonsService = {
  async createLesson(userId: string, input: LessonInput): Promise<LessonResponse> {
    const lesson = await lessonsRepository.createLesson({
      userId,
      title: input.title,
      content: input.content,
      ageGroup: input.ageGroup,
    });

    const task = await tasksRepository.createTask({
      type: 'lesson-generation',
      userId,
      parameters: {
        lessonId: lesson.id,
        title: lesson.title,
        content: lesson.content,
        ageGroup: lesson.ageGroup,
      },
      priority: 1,
    });

    await lessonsRepository.attachTask(lesson.id, task.id);

    await taskQueue.add(
      'lesson-generation',
      {
        taskId: task.id,
        userId,
        parameters: {
          lessonId: lesson.id,
          title: lesson.title,
          content: lesson.content,
          ageGroup: lesson.ageGroup,
        },
      },
      {
        priority: 1,
        jobId: task.id,
      }
    );

    logger.info({ lessonId: lesson.id, taskId: task.id }, 'Lesson generation queued');

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      ageGroup: lesson.ageGroup,
      status: lesson.status,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      output: lesson.output
        ? {
            id: lesson.output.id,
            story: lesson.output.story,
            questions: lesson.output.questions as Record<string, unknown>,
            experiment: lesson.output.experiment as Record<string, unknown>,
            createdAt: lesson.output.createdAt,
          }
        : undefined,
    };
  },

  async getLesson(userId: string, lessonId: string): Promise<LessonResponse> {
    const lesson = await lessonsRepository.findById(lessonId);

    if (!lesson) {
      throw Object.assign(new Error('Lesson not found'), {
        statusCode: 404,
        code: 'LESSON_NOT_FOUND',
      });
    }

    if (lesson.userId !== userId) {
      throw Object.assign(new Error('Access denied'), {
        statusCode: 403,
        code: 'ACCESS_DENIED',
      });
    }

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      ageGroup: lesson.ageGroup,
      status: lesson.status,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      output: lesson.output
        ? {
            id: lesson.output.id,
            story: lesson.output.story,
            questions: lesson.output.questions as Record<string, unknown>,
            experiment: lesson.output.experiment as Record<string, unknown>,
            createdAt: lesson.output.createdAt,
          }
        : undefined,
    };
  },

  async listLessons(userId: string): Promise<LessonResponse[]> {
    const lessons = await lessonsRepository.findByUserId(userId);

    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      ageGroup: lesson.ageGroup,
      status: lesson.status,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      output: lesson.output
        ? {
            id: lesson.output.id,
            story: lesson.output.story,
            questions: lesson.output.questions as Record<string, unknown>,
            experiment: lesson.output.experiment as Record<string, unknown>,
            createdAt: lesson.output.createdAt,
          }
        : undefined,
    }));
  },
};
