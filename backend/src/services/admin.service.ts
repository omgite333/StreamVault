import { prisma } from '../config/database';
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

export const changeUserRole = (id: string, role: 'ADMIN' | 'STUDENT') => userRepo.updateUserRole(id, role);

export const communityMessages = () => communityService.list();

export const communityComments = () => commentService.listAll();

export const communityRemove = (id: string) => communityService.removeAsAdmin(id);

export const commentRemove = (id: string) => commentService.removeAsAdmin(id);

export const getCommunitySettings = () => communityService.isEnabled();

export const setCommunitySettings = (enabled: boolean) => communityService.setEnabled(enabled);
