import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
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

const categories = [
  {
    name: 'Breakfast',
    description: 'Morning meals to start your day right',
    imageUrl:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
  },
  {
    name: 'Lunch Specials',
    description: 'Midday plates that keep you going',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  },
  {
    name: 'Dinner Plates',
    description: 'Hearty dinners for the end of the day',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
  },
  {
    name: 'Appetizers',
    description: 'Small bites to whet your appetite',
    imageUrl:
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
  },
  {
    name: 'Soups & Salads',
    description: 'Light and refreshing options',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  },
  {
    name: 'Burgers & Sandwiches',
    description: 'Classic handheld favourites',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    name: 'Pizza',
    description: 'Wood-fired and oven-baked pizzas',
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    name: 'Pasta',
    description: 'Italian-inspired pasta dishes',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
  },
  {
    name: 'Sushi & Rolls',
    description: 'Fresh Japanese rolls and nigiri',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
  },
  {
    name: 'Rice Bowls',
    description: 'Wholesome bowls built on rice',
    imageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
  },
  {
    name: 'Wraps & Tacos',
    description: 'Handheld wraps and street-style tacos',
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
  },
  {
    name: 'Noodles',
    description: 'Asian-inspired noodle dishes',
    imageUrl:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
  },
  {
    name: 'Grilled Items',
    description: 'Flame-grilled meats and vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  },
  {
    name: 'Seafood',
    description: 'Fresh catches from the sea',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
  },
  {
    name: 'Vegan Delights',
    description: 'Entirely plant-based meals',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  },
  {
    name: 'Desserts',
    description: 'Sweet endings to any meal',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
  },
  {
    name: 'Beverages',
    description: 'Drinks, shakes, and smoothies',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  },
  {
    name: 'Snacks & Sides',
    description: 'Light bites and side dishes',
    imageUrl:
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
  },
  {
    name: 'Family Meals',
    description: 'Large portions perfect for sharing',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    name: "Kid's Menu",
    description: 'Child-friendly favourites',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
  },
];

const seed = async () => {
  console.log('🌱 Seeding meal categories...\n');

  const providers = await prisma.providerProfile.findMany({
    select: { id: true, name: true },
  });

  if (providers.length === 0) {
    console.error(
      '❌ No provider profiles found. Run seed:users first and create provider profiles.',
    );
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const provider = providers[i % providers.length];
    const slug = generateSlug(cat.name);

    const existing = await prisma.mealCategory.findFirst({
      where: { OR: [{ name: cat.name }, { slug }] },
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${cat.name}`);
      skipped++;
      continue;
    }

    await prisma.mealCategory.create({
      data: {
        name: cat.name,
        description: cat.description,
        slug,
        imageUrl: cat.imageUrl,
        status: 'ACTIVE',
        providerId: provider.id,
      },
    });

    console.log(`✅ Created: ${cat.name} → provider: ${provider.name}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
};

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
