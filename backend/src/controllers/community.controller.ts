import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramString } from '../utils/params';
import * as communityService from '../services/community.service';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const messages = await communityService.list();
  res.json({ success: true, message: 'Community messages fetched.', data: messages });
});

export const settings = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Community settings fetched.',
    data: { enabled: await communityService.isEnabled() },
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const message = await communityService.create(req.user!.id, req.body);
  res.status(201).json({ success: true, message: 'Message posted.', data: message });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await communityService.remove(req.user!.id, req.user!.role, paramString(req, 'id'));
  res.json({ success: true, message: 'Message deleted.', data: null });
});
