import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { generateHash } from '../utils/hashing';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const roles = ['PROVIDER', 'CUSTOMER'] as const;
const randomRole = () => roles[Math.floor(Math.random() * roles.length)];

const users = [
  { name: 'Alice Johnson', email: 'alice.johnson@example.com' },
  { name: 'Bob Williams', email: 'bob.williams@example.com' },
  { name: 'Carol Martinez', email: 'carol.martinez@example.com' },
  { name: 'David Brown', email: 'david.brown@example.com' },
  { name: 'Eva Davis', email: 'eva.davis@example.com' },
  { name: 'Frank Wilson', email: 'frank.wilson@example.com' },
  { name: 'Grace Taylor', email: 'grace.taylor@example.com' },
  { name: 'Henry Anderson', email: 'henry.anderson@example.com' },
  { name: 'Isla Thomas', email: 'isla.thomas@example.com' },
  { name: 'Jack Jackson', email: 'jack.jackson@example.com' },
  { name: 'Karen White', email: 'karen.white@example.com' },
  { name: 'Liam Harris', email: 'liam.harris@example.com' },
  { name: 'Mia Thompson', email: 'mia.thompson@example.com' },
  { name: 'Noah Garcia', email: 'noah.garcia@example.com' },
  { name: 'Olivia Lee', email: 'olivia.lee@example.com' },
  { name: 'Peter Robinson', email: 'peter.robinson@example.com' },
  { name: 'Quinn Clark', email: 'quinn.clark@example.com' },
  { name: 'Rachel Lewis', email: 'rachel.lewis@example.com' },
  { name: 'Samuel Hall', email: 'samuel.hall@example.com' },
  { name: 'Tina Young', email: 'tina.young@example.com' },
];

const DEFAULT_PASSWORD = 'password123';

const seed = async () => {
  console.log('🌱 Seeding users...\n');

  const hashedPassword = await generateHash(DEFAULT_PASSWORD);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${user.name}`);
      skipped++;
      continue;
    }

    const role = randomRole();

    const created_user = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role,
        status: 'ACTIVE',
      },
    });

    console.log(
      `✅ Created: ${created_user.name} <${created_user.email}> [${role}]`,
    );
    created++;
  }

  console.log(`\nDone! ${created} created, ${skipped} skipped.`);
  console.log(`Default password for all users: "${DEFAULT_PASSWORD}"`);
};

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
