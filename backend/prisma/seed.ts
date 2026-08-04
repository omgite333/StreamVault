import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@streamvault.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'StreamVault Admin';

async function main() {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN', password },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Admin ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
