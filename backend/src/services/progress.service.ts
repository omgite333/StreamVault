import { ApiError } from '../utils/ApiError';
import * as progressRepo from '../repositories/progress.repository';
import { findVideoById } from '../repositories/video.repository';
import type { UpdateProgressInput } from '../validations/progress.validation';

export const list = async (userId: string) => {
  const items = await progressRepo.findProgressForUser(userId);
  return items.map((item) => ({ ...item, course: item.video.course }));
};

export const update = async (userId: string, input: UpdateProgressInput) => {
  const video = await findVideoById(input.videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found.');
  }

  return progressRepo.upsertProgress(userId, {
    videoId: input.videoId,
    lastTimestamp: input.lastTimestamp,
    completed: input.completed,
  });
};
