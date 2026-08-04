import { prisma } from '../config/database';

export const findAllCourses = () =>
  prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sections: true, videos: true } } },
  });

export const findCourseById = (id: string) =>
  prisma.course.findUnique({
    where: { id },
    include: {
      _count: { select: { sections: true, videos: true } },
      sections: { orderBy: { order: 'asc' }, include: { videos: { orderBy: { order: 'asc' } } } },
      videos: { where: { sectionId: null }, orderBy: { order: 'asc' } },
    },
  });

export const findCourseBySlug = (slug: string) => prisma.course.findUnique({ where: { slug } });

export const createCourse = (data: {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  createdBy: string;
}) => prisma.course.create({ data });

export const updateCourse = (
  id: string,
  data: { title?: string; slug?: string; description?: string; thumbnail?: string | null },
) => prisma.course.update({ where: { id }, data });

export const deleteCourse = (id: string) => prisma.course.delete({ where: { id } });
