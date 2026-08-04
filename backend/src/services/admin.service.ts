import { prisma } from '../config/database';
import * as userRepo from '../repositories/user.repository';

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
