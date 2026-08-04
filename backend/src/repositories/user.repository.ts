import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  profileImage: true,
  isVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const findPublicUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: publicUserSelect });

export const createUser = (data: { name: string; email: string; password: string }) =>
  prisma.user.create({ data, select: publicUserSelect });

export const createOAuthUser = (data: {
  name: string;
  email: string;
  profileImage: string | null;
  provider: string;
  providerAccountId: string;
}) =>
  prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      profileImage: data.profileImage,
      password: null,
      isVerified: true,
      oauthAccounts: {
        create: { provider: data.provider, providerAccountId: data.providerAccountId },
      },
    },
    select: publicUserSelect,
  });

export const findUserByOAuthAccount = (provider: string, providerAccountId: string) =>
  prisma.user.findFirst({
    where: { oauthAccounts: { some: { provider, providerAccountId } } },
    select: publicUserSelect,
  });

export const linkOAuthAccount = (
  userId: string,
  data: { provider: string; providerAccountId: string },
) => prisma.oAuthAccount.create({ data: { userId, ...data } });

export const findAllUsers = () => prisma.user.findMany({ select: publicUserSelect, orderBy: { createdAt: 'desc' } });

export const updateUserRole = (id: string, role: 'ADMIN' | 'STUDENT') =>
  prisma.user.update({ where: { id }, data: { role }, select: publicUserSelect });

export const updateUser = (id: string, data: { name?: string; profileImage?: string | null }) =>
  prisma.user.update({ where: { id }, data, select: publicUserSelect });

export const updateUserPassword = (id: string, password: string) =>
  prisma.user.update({ where: { id }, data: { password } });
