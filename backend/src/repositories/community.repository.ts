import { prisma } from '../config/database';

const authorSelect = {
  select: { id: true, name: true, profileImage: true, role: true },
};

const parentSelect = {
  select: { id: true, content: true, author: { select: { id: true, name: true } } },
};

export const findAllMessages = () =>
  prisma.communityMessage.findMany({
    orderBy: { createdAt: 'asc' },
    include: { author: authorSelect, parent: parentSelect },
  });

export const findMessageById = (id: string) => prisma.communityMessage.findUnique({ where: { id } });

export const createMessage = (data: { content: string; parentId: string | null; authorId: string }) =>
  prisma.communityMessage.create({
    data: {
      content: data.content,
      parentId: data.parentId,
      authorId: data.authorId,
    },
    include: { author: authorSelect, parent: parentSelect },
  });

export const deleteMessage = (id: string) => prisma.communityMessage.delete({ where: { id } });
