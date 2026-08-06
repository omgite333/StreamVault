import { prisma } from '../config/database';
import { logger } from '../config/logger';
import * as userRepo from '../repositories/user.repository';
import * as communityService from './community.service';
import * as commentService from './comment.service';

export const analytics = async () => {
  const [totalCourses, totalVideos, totalUsers, totalViews] = await Promise.all([
    prisma.course.count(),
    prisma.video.count(),
    prisma.user.count(),
    prisma.progress.count(),
  ]);

  return { totalCourses, totalVideos, totalUsers, totalViews };
};

export const listUsers = () => userRepo.findAllUsers();

export const changeUserRole = async (id: string, role: 'ADMIN' | 'STUDENT', adminId: string) => {
  const user = await userRepo.updateUserRole(id, role);
  logger.info({ userId: id, role, actorId: adminId }, 'User role changed by admin');
  return user;
};

export const communityMessages = () => communityService.list();

export const communityComments = () => commentService.listAll();

export const communityRemove = (adminId: string, id: string) => communityService.removeAsAdmin(id, adminId);

export const commentRemove = (adminId: string, id: string) => commentService.removeAsAdmin(id, adminId);

export const getCommunitySettings = () => communityService.isEnabled();

export const setCommunitySettings = (enabled: boolean, adminId: string) =>
  communityService.setEnabled(enabled, adminId);
