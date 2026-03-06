import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { generateHash } from '../utils/hashing';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    console.error(
      '❌ ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must be set in .env',
    );
    process.exit(1);
  }

  console.log('🌱 Seeding admin...\n');

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`⏭️  Skipped: Admin already exists (${ADMIN_EMAIL})`);
    return;
  }

  const hashedPassword = await generateHash(ADMIN_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Admin created: ${admin.name} <${admin.email}>`);
};

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
