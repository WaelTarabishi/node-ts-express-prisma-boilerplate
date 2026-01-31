import { Request, Response } from 'express';
import { lessonsService } from './lessons.service.js';
import { createLessonSchema } from './lessons.schemas.js';

export const lessonsController = {
  async createLesson(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const input = createLessonSchema.parse(req.body);
    const lesson = await lessonsService.createLesson(req.user.id, input);
    res.status(201).json(lesson);
  },

  async getLesson(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const lesson = await lessonsService.getLesson(req.user.id, req.params.id);
    res.json(lesson);
  },

  async listLessons(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const lessons = await lessonsService.listLessons(req.user.id);
    res.json(lessons);
  },
};
