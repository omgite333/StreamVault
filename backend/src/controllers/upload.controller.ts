import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as uploadService from '../services/upload.service';

export const getUploadUrl = asyncHandler(async (req: Request, res: Response) => {
  const { fileType, folder } = req.body as {
    fileType: string;
    folder: 'videos' | 'thumbnails' | 'resources' | 'avatars';
  };

  const { url, key } = await uploadService.generateUploadUrl(fileType, folder, req.user?.id);
  res.status(201).json({ success: true, message: 'Presigned upload URL generated.', data: { url, key } });
});
