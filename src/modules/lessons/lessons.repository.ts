import { prisma } from '../../lib/db.js';
import { LessonStatus } from '@prisma/client';

export const lessonsRepository = {
  async createLesson(data: {
    userId: string;
    title: string;
    content: string;
    ageGroup: string;
  }) {
    return prisma.lesson.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        ageGroup: data.ageGroup,
        status: LessonStatus.QUEUED,
      },
      include: {
        output: true,
      },
    });
  },

  async attachTask(lessonId: string, taskId: string) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data: { taskId },
    });
  },

  async updateStatus(lessonId: string, status: LessonStatus) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data: { status },
    });
  },

  async createOutput(data: {
    lessonId: string;
    story: string;
    questions: Record<string, unknown>;
    experiment: Record<string, unknown>;
  }) {
    return prisma.lessonOutput.create({
      data: {
        lessonId: data.lessonId,
        story: data.story,
        questions: data.questions,
        experiment: data.experiment,
      },
    });
  },

  async findById(lessonId: string) {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { output: true },
    });
  },

  async findByUserId(userId: string, limit = 50) {
    return prisma.lesson.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { output: true },
    });
  },
};
