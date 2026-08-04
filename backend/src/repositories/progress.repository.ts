import { prisma } from '../config/database';

export const findProgressForUser = (userId: string) =>
  prisma.progress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      video: { include: { course: { select: { id: true, title: true } } } },
    },
  });

export const upsertProgress = (userId: string, data: { videoId: string; lastTimestamp: number; completed: boolean }) =>
  prisma.progress.upsert({
    where: { userId_videoId: { userId, videoId: data.videoId } },
    update: { lastTimestamp: data.lastTimestamp, completed: data.completed },
    create: { ...data, userId },
  });
