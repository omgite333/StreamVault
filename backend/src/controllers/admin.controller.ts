import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { paramString } from '../utils/params';
import * as adminService from '../services/admin.service';

const roleSchema = z.object({
  role: z.enum(['ADMIN', 'STUDENT']),
});

export const analytics = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.analytics();
  res.json({ success: true, message: 'Analytics fetched.', data });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await adminService.listUsers();
  res.json({ success: true, message: 'Users fetched.', data: users });
});

export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues.map((issue) => issue.message).join(', '));
  }

  const user = await adminService.changeUserRole(paramString(req, 'id'), parsed.data.role);
  res.json({ success: true, message: 'User role updated.', data: user });
});
