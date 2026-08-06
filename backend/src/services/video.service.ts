import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import * as videoRepo from '../repositories/video.repository';
import * as courseRepo from '../repositories/course.repository';
import { generateStreamUrl, resolveObjectUrl } from './upload.service';
import type { CreateVideoInput, UpdateVideoInput } from '../validations/video.validation';

const ensureExists = async (id: string) => {
  const video = await videoRepo.findVideoById(id);
  if (!video) {
    throw new ApiError(404, 'Video not found.');
  }
  return video;
};

export const getById = async (id: string) => {
  const video = await ensureExists(id);
  const [streamUrl, thumbnailUrl] = await Promise.all([
    generateStreamUrl(video.s3Key),
    resolveObjectUrl(video.thumbnail),
  ]);
  return { ...video, streamUrl, thumbnailUrl };
};

export const create = async (input: CreateVideoInput) => {
  const course = await courseRepo.findCourseById(input.courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const video = await videoRepo.createVideo({
    courseId: input.courseId,
    sectionId: input.sectionId ?? null,
    title: input.title,
    description: input.description,
    duration: input.duration,
    thumbnail: input.thumbnail,
    s3Key: input.s3Key,
    order: input.order,
    allowDownload: input.allowDownload,
  });

  logger.info({ videoId: video.id, courseId: input.courseId, title: input.title }, 'Video created');
  return video;
};

export const update = async (id: string, input: UpdateVideoInput) => {
  await ensureExists(id);
  const video = await videoRepo.updateVideo(id, input as Prisma.VideoUpdateInput);
  logger.info({ videoId: id }, 'Video updated');
  return video;
};

export const remove = async (id: string) => {
  const video = await ensureExists(id);
  await videoRepo.deleteVideo(id);
  logger.info({ videoId: id }, 'Video deleted');
  return video;
};

export const addResource = async (input: { videoId: string; title: string; fileUrl: string; type: string }) => {
  await ensureExists(input.videoId);
  const resource = await videoRepo.createResource(input);
  logger.info({ resourceId: resource.id, videoId: input.videoId }, 'Resource added to video');
  return resource;
};

export const removeResource = async (id: string) => {
  await videoRepo.deleteResource(id);
  logger.info({ resourceId: id }, 'Resource removed');
};
