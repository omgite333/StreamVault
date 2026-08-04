import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramString } from '../utils/params';
import * as courseService from '../services/course.service';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await courseService.list();
  res.json({ success: true, message: 'Courses fetched.', data: courses });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getById(paramString(req, 'id'));
  res.json({ success: true, message: 'Course fetched.', data: course });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.create(req.body, req.user!.id);
  res.status(201).json({ success: true, message: 'Course created.', data: course });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.update(paramString(req, 'id'), req.body);
  res.json({ success: true, message: 'Course updated.', data: course });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await courseService.remove(paramString(req, 'id'));
  res.json({ success: true, message: 'Course deleted.', data: null });
});
