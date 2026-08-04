import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as progressService from '../services/progress.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const progress = await progressService.list(req.user!.id);
  res.json({ success: true, message: 'Progress fetched.', data: progress });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const progress = await progressService.update(req.user!.id, req.body);
  res.json({ success: true, message: 'Progress saved.', data: progress });
});
