import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const cuisines = [
  {
    name: 'Italian',
    description: 'Classic Italian dishes including pasta, pizza, and risotto.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
  },
  {
    name: 'Japanese',
    description: 'Traditional Japanese cuisine with sushi, ramen, and tempura.',
    imageUrl:
      'https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=400',
  },
  {
    name: 'Mexican',
    description: 'Vibrant Mexican food with tacos, burritos, and enchiladas.',
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
  },
  {
    name: 'Indian',
    description: 'Rich Indian curries, biryanis, and tandoori specialties.',
    imageUrl:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
  },
  {
    name: 'Chinese',
    description: 'Authentic Chinese stir-fries, dim sum, and noodles.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
  },
  {
    name: 'Thai',
    description: 'Aromatic Thai cuisine with curries, pad thai, and satay.',
    imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400',
  },
  {
    name: 'American',
    description: 'Classic American burgers, BBQ, and mac and cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400',
  },
  {
    name: 'Mediterranean',
    description: 'Healthy Mediterranean dishes with fresh herbs and olive oil.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  },
  {
    name: 'French',
    description:
      'Elegant French cuisine with crepes, croissants, and coq au vin.',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    name: 'Greek',
    description: 'Fresh Greek food with gyros, souvlaki, and moussaka.',
    imageUrl:
      'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=400',
  },
  {
    name: 'Korean',
    description: 'Bold Korean flavors with bulgogi, bibimbap, and kimchi.',
    imageUrl:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
  },
  {
    name: 'Lebanese',
    description: 'Fresh Lebanese mezze, shawarma, and falafel.',
    imageUrl: 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400',
  },
  {
    name: 'Turkish',
    description: 'Rich Turkish kebabs, baklava, and mezes.',
    imageUrl:
      'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400',
  },
  {
    name: 'Vietnamese',
    description: 'Light Vietnamese pho, banh mi, and fresh spring rolls.',
    imageUrl:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
  },
  {
    name: 'Spanish',
    description: 'Lively Spanish paella, tapas, and churros.',
    imageUrl:
      'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400',
  },
  {
    name: 'Brazilian',
    description: 'Hearty Brazilian churrasco, feijoada, and coxinha.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    name: 'Ethiopian',
    description: 'Unique Ethiopian injera with spiced lentil and meat stews.',
    imageUrl:
      'https://images.unsplash.com/photo-1612392062628-e657e6d84e7d?w=400',
  },
  {
    name: 'Moroccan',
    description: 'Fragrant Moroccan tagines, couscous, and pastilla.',
    imageUrl:
      'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400',
  },
  {
    name: 'Bangladeshi',
    description:
      'Flavorful Bangladeshi hilsa fish, biryani, and traditional pithas.',
    imageUrl:
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
  },
  {
    name: 'Seafood',
    description:
      'Fresh ocean-to-table seafood dishes, shellfish, and grilled fish.',
    imageUrl:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
  },
];

const seed = async () => {
  console.log('🌱 Seeding cuisines...\n');

  let created = 0;
  let skipped = 0;

  for (const item of cuisines) {
    const slug = generateSlug(item.name);

    const existing = await prisma.cuisine.findFirst({
      where: { OR: [{ name: item.name }, { slug }] },
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${item.name}`);
      skipped++;
      continue;
    }

    await prisma.cuisine.create({
      data: {
        name: item.name,
        description: item.description,
        slug,
        imageUrl: item.imageUrl,
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Created: ${item.name}`);
    created++;
  }

  console.log(`\nDone! ${created} created, ${skipped} skipped.`);
};

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
