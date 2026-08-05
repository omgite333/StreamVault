import { prisma } from '../config/database';

const authorSelect = {
  select: { id: true, name: true, profileImage: true, role: true },
};

export const findCommentsByVideoId = (videoId: string) =>
  prisma.videoComment.findMany({
    where: { videoId },
    orderBy: { createdAt: 'asc' },
    include: { author: authorSelect },
  });

export const findAllComments = () =>
  prisma.videoComment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: authorSelect,
      video: { select: { id: true, title: true } },
    },
  });

export const findCommentById = (id: string) => prisma.videoComment.findUnique({ where: { id } });

export const createComment = (data: { content: string; videoId: string; authorId: string }) =>
  prisma.videoComment.create({
    data,
    include: { author: authorSelect },
  });

export const deleteComment = (id: string) => prisma.videoComment.delete({ where: { id } });
