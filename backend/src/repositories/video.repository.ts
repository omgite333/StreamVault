import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const findVideoById = (id: string) =>
  prisma.video.findUnique({ where: { id }, include: { resources: true } });

export const createVideo = (data: {
  courseId: string;
  sectionId?: string | null;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  s3Key: string;
  order?: number;
  allowDownload?: boolean;
}) => prisma.video.create({ data });

export const updateVideo = (id: string, data: Prisma.VideoUpdateInput) =>
  prisma.video.update({ where: { id }, data });

export const deleteVideo = (id: string) => prisma.video.delete({ where: { id } });

export const createResource = (data: { videoId: string; title: string; fileUrl: string; type: string }) =>
  prisma.resource.create({ data });

export const deleteResource = (id: string) => prisma.resource.delete({ where: { id } });
