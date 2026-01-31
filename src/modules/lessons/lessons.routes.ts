import { Router } from 'express';
import { lessonsController } from './lessons.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const lessonsRoutes = Router();

lessonsRoutes.use(authMiddleware);

// POST /api/lessons - Create lesson and queue generation
lessonsRoutes.post('/', (req, res, next) => {
  lessonsController.createLesson(req, res).catch(next);
});

// GET /api/lessons - List lessons
lessonsRoutes.get('/', (req, res, next) => {
  lessonsController.listLessons(req, res).catch(next);
});

// GET /api/lessons/:id - Get lesson details
lessonsRoutes.get('/:id', (req, res, next) => {
  lessonsController.getLesson(req, res).catch(next);
});
