import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { resolveObjectUrl } from './upload.service';
import * as commentRepo from '../repositories/comment.repository';
import { findVideoById } from '../repositories/video.repository';
import type { CreateCommentInput } from '../validations/comment.validation';

type VideoComment = Awaited<ReturnType<typeof commentRepo.findCommentsByVideoId>>[number];

const withAuthorAvatar = async (comment: VideoComment) => ({
  ...comment,
  author: {
    ...comment.author,
    profileImageUrl: await resolveObjectUrl(comment.author.profileImage),
  },
});

export const list = async (videoId: string) => {
  const comments = await commentRepo.findCommentsByVideoId(videoId);
  return Promise.all(comments.map(withAuthorAvatar));
};

export const listAll = async () => {
  const comments = await commentRepo.findAllComments();
  return Promise.all(comments.map(withAuthorAvatar));
};

export const create = async (videoId: string, authorId: string, input: CreateCommentInput) => {
  const video = await findVideoById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found.');
  }

  const comment = await commentRepo.createComment({
    videoId,
    authorId,
    content: input.content,
  });

  logger.info({ commentId: comment.id, videoId, authorId }, 'Video comment posted');
  return withAuthorAvatar(comment);
};

export const remove = async (userId: string, role: string, videoId: string, id: string) => {
  const comment = await commentRepo.findCommentById(id);
  if (!comment || comment.videoId !== videoId) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (comment.authorId !== userId && role !== 'ADMIN') {
    logger.warn({ commentId: id, userId, role }, 'Comment deletion denied');
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  await commentRepo.deleteComment(id);
  logger.info({ commentId: id, deletedBy: userId, asAdmin: role === 'ADMIN' }, 'Video comment deleted');
};

export const removeAsAdmin = async (id: string, actorId?: string) => {
  const comment = await commentRepo.findCommentById(id);
  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  await commentRepo.deleteComment(id);
  logger.info({ commentId: id, actorId, asAdmin: true }, 'Video comment deleted by admin');
};
