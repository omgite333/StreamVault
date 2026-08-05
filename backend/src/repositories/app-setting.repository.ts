import { prisma } from '../config/database';

export const getSetting = (key: string) => prisma.appSetting.findUnique({ where: { key } });

export const upsertSetting = (key: string, value: string) =>
  prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
