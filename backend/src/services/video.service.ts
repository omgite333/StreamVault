import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
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

  return videoRepo.createVideo({
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
};

export const update = async (id: string, input: UpdateVideoInput) => {
  await ensureExists(id);
  return videoRepo.updateVideo(id, input as Prisma.VideoUpdateInput);
};

export const remove = async (id: string) => {
  const video = await ensureExists(id);
  await videoRepo.deleteVideo(id);
  return video;
};

export const addResource = async (input: { videoId: string; title: string; fileUrl: string; type: string }) => {
  await ensureExists(input.videoId);
  return videoRepo.createResource(input);
};

export const removeResource = async (id: string) => {
  await videoRepo.deleteResource(id);
};
