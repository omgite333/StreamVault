import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramString } from '../utils/params';
import * as commentService from '../services/comment.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const comments = await commentService.list(paramString(req, 'videoId'));
  res.json({ success: true, message: 'Comments fetched.', data: comments });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.create(paramString(req, 'videoId'), req.user!.id, req.body);
  res.status(201).json({ success: true, message: 'Comment posted.', data: comment });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await commentService.remove(
    req.user!.id,
    req.user!.role,
    paramString(req, 'videoId'),
    paramString(req, 'commentId'),
  );
  res.json({ success: true, message: 'Comment deleted.', data: null });
});
