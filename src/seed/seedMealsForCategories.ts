import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/* ─── Target category IDs ─── */
const CATEGORY_IDS = [
  '02591b20-139a-4e94-82b9-0d613319eb4b',
  '02cebcaf-7a13-47e0-a58e-c16d7c3a5618',
  '09db49f5-c640-4cdc-aecd-d5cdde94df31',
  '0fcaa373-edf9-4c87-99d2-89ed6f23484b',
  '2ad4f4d6-074b-4c6d-8afe-012c51d5e59b',
  '3242fc72-8100-4304-8579-f25b5c93ce35',
  '40f183e6-a5cb-4226-9fa3-32877f111751',
  '4bc473f4-b551-4de6-b582-c4edeb26065b',
  '5144d528-e6c7-4c74-aec1-80e539ffbe3d',
];

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

/* 2-3 meals per slot, indexed by position 0–8 */
type MealDef = {
  name: string;
  description: string;
  price: number;
  discount: number | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  isVegan: boolean;
  isBestSeller: boolean;
  preparationTime: number;
  imageUrl: string;
};

const mealSlots: MealDef[][] = [
  /* slot 0 */
  [
    {
      name: 'Spicy Chicken Wings',
      description:
        'Crispy chicken wings tossed in buffalo hot sauce with blue cheese dip',
      price: 9.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400',
    },
    {
      name: 'Honey Garlic Ribs',
      description: 'Slow-cooked pork ribs glazed with honey and roasted garlic',
      price: 16.0,
      discount: 10,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 35,
      imageUrl:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    },
    {
      name: 'Prawn Tempura',
      description:
        'Light and crispy beer-battered prawns with citrus ponzu sauce',
      price: 12.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    },
  ],
  /* slot 1 */
  [
    {
      name: 'Butter Chicken',
      description:
        'Tender chicken breast in a velvety tomato-butter masala sauce',
      price: 13.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    },
    {
      name: 'Paneer Tikka',
      description:
        'Marinated cottage cheese cubes grilled in a tandoor, served with mint chutney',
      price: 11.0,
      discount: 5,
      discountType: 'FIXED',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    },
    {
      name: 'Dal Makhani',
      description:
        'Slow-cooked black lentils simmered overnight with cream and spices',
      price: 10.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    },
  ],
  /* slot 2 */
  [
    {
      name: 'BBQ Chicken Pizza',
      description:
        'Smoky BBQ base with grilled chicken, red onion, and mozzarella',
      price: 13.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
    {
      name: 'Pepperoni Feast',
      description:
        'Double-layer pepperoni on tomato sauce and stretchy mozzarella',
      price: 14.5,
      discount: 10,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
    {
      name: 'Veggie Supreme Pizza',
      description:
        'Roasted capsicum, olives, mushrooms, and spinach on a thin crust',
      price: 12.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
  ],
  /* slot 3 */
  [
    {
      name: 'Chicken Alfredo',
      description:
        'Fettuccine in rich Alfredo cream sauce with grilled chicken and parmesan',
      price: 14.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 22,
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    },
    {
      name: 'Penne Arrabbiata',
      description:
        'Penne in spicy tomato sauce with garlic, chilli flakes, and fresh basil',
      price: 11.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    },
    {
      name: 'Truffle Mushroom Pasta',
      description:
        'Pappardelle with wild mushrooms, truffle oil, and aged parmesan',
      price: 16.0,
      discount: 8,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    },
  ],
  /* slot 4 */
  [
    {
      name: 'Classic Cheeseburger',
      description:
        'Beef patty, cheddar, lettuce, tomato, pickles, and house burger sauce',
      price: 10.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      name: 'Crispy Chicken Burger',
      description:
        'Southern-fried chicken thigh with jalapeño slaw and sriracha mayo',
      price: 11.0,
      discount: 5,
      discountType: 'FIXED',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      name: 'Mushroom Swiss Burger',
      description:
        'Beef patty topped with sautéed mushrooms, Swiss cheese, and Dijon mayo',
      price: 12.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
  ],
  /* slot 5 */
  [
    {
      name: 'Spicy Tuna Roll',
      description:
        'Fresh tuna, sriracha, and cucumber rolled in nori with sesame seeds',
      price: 10.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
    },
    {
      name: 'Rainbow Roll',
      description:
        'Eight-piece maki topped with tuna, salmon, and avocado slices',
      price: 14.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
    },
    {
      name: 'Vegetable Maki Set',
      description: 'Six-piece cucumber, avocado, and pickled radish rolls',
      price: 8.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
    },
  ],
  /* slot 6 */
  [
    {
      name: 'Beef Teriyaki Bowl',
      description:
        'Sliced teriyaki beef over steamed rice with pickled ginger and sesame',
      price: 13.0,
      discount: 10,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'Tofu Poke Bowl',
      description:
        'Sushi rice topped with marinated tofu, edamame, mango, and furikake',
      price: 11.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'Shrimp Fried Rice',
      description:
        'Wok-tossed jasmine rice with tiger shrimp, egg, spring onion, and soy',
      price: 12.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
  ],
  /* slot 7 */
  [
    {
      name: 'Greek Salad',
      description:
        'Tomato, cucumber, red onion, Kalamata olives, and feta with oregano dressing',
      price: 8.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    },
    {
      name: 'Pumpkin Soup',
      description:
        'Roasted pumpkin and ginger blended soup with toasted pepitas',
      price: 7.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    },
    {
      name: 'Chicken Noodle Soup',
      description:
        'Clear broth with shredded chicken, egg noodles, and vegetables',
      price: 9.0,
      discount: 5,
      discountType: 'FIXED',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    },
  ],
  /* slot 8 */
  [
    {
      name: 'Açai Smoothie Bowl',
      description:
        'Blended açai with banana, topped with granola, berries, and honey',
      price: 10.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: true,
      preparationTime: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'Strawberry Banana Shake',
      description: 'Fresh strawberries and banana blended with oat milk',
      price: 5.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 5,
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'Iced Matcha Latte',
      description: 'Ceremonial grade matcha whisked with oat milk over ice',
      price: 5.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: true,
      preparationTime: 5,
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
  ],
];

/* ─── SEED ─── */

const seed = async () => {
  console.log('🌱 Seeding meals for specified categories...\n');

  const categories = await prisma.mealCategory.findMany({
    where: { id: { in: CATEGORY_IDS } },
    select: { id: true, name: true, providerId: true },
  });

  if (categories.length === 0) {
    console.error('❌ None of the provided category IDs were found in the DB.');
    process.exit(1);
  }

  console.log(
    `Found ${categories.length} / ${CATEGORY_IDS.length} categories:\n`,
  );
  categories.forEach((c) => console.log(`  • ${c.name} (${c.id})`));
  console.log('');

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < CATEGORY_IDS.length; i++) {
    const catId = CATEGORY_IDS[i];
    const cat = categories.find((c) => c.id === catId);

    if (!cat) {
      console.warn(`⚠️  Category ID not found in DB: ${catId}`);
      continue;
    }

    const meals = mealSlots[i] ?? mealSlots[i % mealSlots.length];

    for (const meal of meals) {
      const slug = generateSlug(meal.name);

      const existing = await prisma.meal.findFirst({
        where: { OR: [{ name: meal.name }, { slug }] },
      });

      if (existing) {
        console.log(`⏭️  Skipped (exists): ${meal.name}`);
        skipped++;
        continue;
      }

      await prisma.meal.create({
        data: {
          name: meal.name,
          description: meal.description,
          slug,
          price: meal.price,
          discount: meal.discount,
          discountType: meal.discountType,
          imageUrl: meal.imageUrl,
          status: 'AVAILABLE',
          isVegan: meal.isVegan,
          isBestSeller: meal.isBestSeller,
          preparationTime: meal.preparationTime,
          providerId: cat.providerId,
          mealCategoryId: cat.id,
        },
      });

      console.log(`✅ Created: ${meal.name} → [${cat.name}]`);
      created++;
    }
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
};

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
