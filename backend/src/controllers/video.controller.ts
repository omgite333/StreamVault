import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramString } from '../utils/params';
import * as videoService from '../services/video.service';

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.getById(paramString(req, 'id'));
  res.json({ success: true, message: 'Video fetched.', data: video });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.create(req.body);
  res.status(201).json({ success: true, message: 'Video created.', data: video });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.update(paramString(req, 'id'), req.body);
  res.json({ success: true, message: 'Video updated.', data: video });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await videoService.remove(paramString(req, 'id'));
  res.json({ success: true, message: 'Video deleted.', data: null });
});

export const addResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await videoService.addResource(req.body);
  res.status(201).json({ success: true, message: 'Resource added.', data: resource });
});

export const removeResource = asyncHandler(async (req: Request, res: Response) => {
  await videoService.removeResource(paramString(req, 'id'));
  res.json({ success: true, message: 'Resource deleted.', data: null });
});
