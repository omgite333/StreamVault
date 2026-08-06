import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slug';
import { logger } from '../config/logger';
import { resolveObjectUrl } from './upload.service';
import * as courseRepo from '../repositories/course.repository';
import type { CreateCourseInput, UpdateCourseInput } from '../validations/course.validation';

export const list = () => courseRepo.findAllCourses();

const decorateVideo = async (video: { thumbnail: string | null }) => ({
  ...video,
  thumbnailUrl: await resolveObjectUrl(video.thumbnail),
});

export const getById = async (id: string) => {
  const course = await courseRepo.findCourseById(id);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const sections = await Promise.all(
    (course.sections ?? []).map(async (section) => ({
      ...section,
      videos: await Promise.all((section.videos ?? []).map(decorateVideo)),
    })),
  );
  const videos = await Promise.all((course.videos ?? []).map(decorateVideo));

  return { ...course, sections, videos };
};

export const create = async (input: CreateCourseInput, createdBy: string) => {
  const baseSlug = slugify(input.title);
  let slug = baseSlug;
  let attempt = 1;
  while (await courseRepo.findCourseBySlug(slug)) {
    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  const course = await courseRepo.createCourse({
    title: input.title,
    slug,
    description: input.description,
    thumbnail: input.thumbnail || undefined,
    createdBy,
  });

  logger.info({ courseId: course.id, slug: course.slug, createdBy }, 'Course created');
  return course;
};

export const update = async (id: string, input: UpdateCourseInput) => {
  await getById(id);

  const updated = await courseRepo.updateCourse(id, {
    ...(input.title !== undefined ? { title: input.title, slug: slugify(input.title) } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail || null } : {}),
  });

  logger.info({ courseId: id }, 'Course updated');
  return updated;
};

export const remove = async (id: string) => {
  await getById(id);
  await courseRepo.deleteCourse(id);
  logger.info({ courseId: id }, 'Course deleted');
};
