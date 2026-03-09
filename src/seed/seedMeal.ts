import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { generateSlug } from '../utils/slug';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const meals = [
  {
    name: 'Grilled Chicken Sandwich',
    description:
      'Juicy grilled chicken with lettuce, tomato, and garlic mayo on a toasted brioche bun',
    price: 8.99,
    discount: 10,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 15,
    preferredCategory: 'Burgers & Sandwiches',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    name: 'Margherita Pizza',
    description:
      'Classic tomato base with fresh mozzarella, basil, and extra-virgin olive oil',
    price: 11.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 20,
    preferredCategory: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    name: 'Spaghetti Carbonara',
    description:
      'Al-dente spaghetti tossed with pancetta, egg yolk, pecorino romano, and black pepper',
    price: 13.0,
    discount: 5,
    discountType: 'FIXED_AMOUNT' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 18,
    preferredCategory: 'Pasta',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
  },
  {
    name: 'California Roll',
    description:
      'Crab, avocado and cucumber inside out roll topped with sesame seeds',
    price: 9.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 12,
    preferredCategory: 'Sushi & Rolls',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
  },
  {
    name: 'Beef Burger Deluxe',
    description:
      'Double smash patty, aged cheddar, caramelised onions, and house sauce',
    price: 12.99,
    discount: 15,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 20,
    preferredCategory: 'Burgers & Sandwiches',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    name: 'Caesar Salad',
    description:
      'Crisp romaine lettuce, croutons, parmesan shavings, and house Caesar dressing',
    price: 7.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 8,
    preferredCategory: 'Soups & Salads',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  },
  {
    name: 'Avocado Toast',
    description:
      'Smashed avocado on sourdough with cherry tomatoes, dukkah, and chilli flakes',
    price: 9.0,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: true,
    isBestSeller: false,
    preparationTime: 10,
    preferredCategory: 'Breakfast',
    imageUrl:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
  },
  {
    name: 'Chicken Tikka Masala',
    description:
      'Tender chicken in a rich, creamy tomato-based masala sauce with basmati rice',
    price: 14.5,
    discount: 10,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 25,
    preferredCategory: 'Dinner Plates',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
  },
  {
    name: 'Tom Yum Soup',
    description:
      'Spicy and sour Thai soup with shrimp, lemongrass, kaffir lime, and mushrooms',
    price: 8.0,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 15,
    preferredCategory: 'Soups & Salads',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  },
  {
    name: 'Veggie Wrap',
    description:
      'Grilled vegetables, hummus, feta, and rocket in a wholegrain tortilla',
    price: 7.99,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: true,
    isBestSeller: false,
    preparationTime: 10,
    preferredCategory: 'Wraps & Tacos',
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
  },
  {
    name: 'Salmon Teriyaki Bowl',
    description:
      'Pan-seared salmon fillet with steamed jasmine rice, edamame, and teriyaki glaze',
    price: 16.0,
    discount: 5,
    discountType: 'FIXED_AMOUNT' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 20,
    preferredCategory: 'Rice Bowls',
    imageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
  },
  {
    name: 'Pad Thai',
    description:
      'Stir-fried rice noodles with tofu, bean sprouts, peanuts, and tamarind sauce',
    price: 11.0,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 15,
    preferredCategory: 'Noodles',
    imageUrl:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
  },
  {
    name: 'BBQ Ribs Platter',
    description:
      'Slow-cooked pork ribs with smoky BBQ glaze, coleslaw, and corn on the cob',
    price: 22.0,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 35,
    preferredCategory: 'Grilled Items',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  },
  {
    name: 'Fish & Chips',
    description:
      'Beer-battered Atlantic cod with thick-cut chips, mushy peas, and tartare sauce',
    price: 14.0,
    discount: 10,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 20,
    preferredCategory: 'Seafood',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
  },
  {
    name: 'Mushroom Risotto',
    description:
      'Creamy arborio rice with wild mushrooms, white wine, and parmesan',
    price: 13.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: true,
    isBestSeller: false,
    preparationTime: 25,
    preferredCategory: 'Vegan Delights',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  },
  {
    name: 'Chocolate Lava Cake',
    description:
      'Warm dark chocolate fondant with a molten centre, served with vanilla ice cream',
    price: 7.0,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 15,
    preferredCategory: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
  },
  {
    name: 'Mango Lassi',
    description: 'Chilled blended mango, yoghurt, and cardamom drink',
    price: 4.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 5,
    preferredCategory: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted baguette brushed with garlic herb butter',
    price: 3.99,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: true,
    isBestSeller: false,
    preparationTime: 8,
    preferredCategory: 'Snacks & Sides',
    imageUrl:
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
  },
  {
    name: 'Fried Chicken Bucket',
    description:
      'Twelve pieces of crispy southern-fried chicken with dipping sauces',
    price: 28.0,
    discount: 8,
    discountType: 'FIXED_AMOUNT' as const,
    isVegan: false,
    isBestSeller: true,
    preparationTime: 30,
    preferredCategory: 'Family Meals',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    name: 'Mini Cheese Pizza',
    description:
      'Individual pizza with tomato sauce, mozzarella, and hidden veggie toppings',
    price: 6.5,
    discount: null,
    discountType: 'PERCENTAGE' as const,
    isVegan: false,
    isBestSeller: false,
    preparationTime: 15,
    preferredCategory: "Kid's Menu",
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
  },
];

const seed = async () => {
  console.log('🌱 Seeding meals...\n');

  const providers = await prisma.providerProfile.findMany({
    select: { id: true, name: true },
  });

  if (providers.length === 0) {
    console.error(
      '❌ No provider profiles found. Run seed:users first and create provider profiles.',
    );
    process.exit(1);
  }

  const allCategories = await prisma.mealCategory.findMany({
    select: { id: true, name: true, providerId: true },
  });

  const categoryByName = new Map(allCategories.map((c) => [c.name, c]));

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];
    const slug = generateSlug(meal.name);

    const existing = await prisma.meal.findFirst({
      where: { OR: [{ name: meal.name }, { slug }] },
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${meal.name}`);
      skipped++;
      continue;
    }

    // Try to use the preferred category; fall back to any category for this provider
    const preferredCat = categoryByName.get(meal.preferredCategory);
    const provider = preferredCat
      ? (providers.find((p) => p.id === preferredCat.providerId) ??
        providers[i % providers.length])
      : providers[i % providers.length];

    const providerCategories = allCategories.filter(
      (c) => c.providerId === provider.id,
    );
    const mealCategory =
      preferredCat?.providerId === provider.id
        ? preferredCat
        : (providerCategories[0] ?? null);

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
        providerId: provider.id,
        mealCategoryId: mealCategory?.id ?? null,
      },
    });

    console.log(
      `✅ Created: ${meal.name} → provider: ${provider.name}, category: ${mealCategory?.name ?? 'none'}`,
    );
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
