import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/* ─────────────── CONFIG ─────────────── */

const USER_IDS = [
  '027ed4d0-67ce-4234-9ee2-deec6b16edab',
  '0498c937-8980-4ca1-a2da-1d908f50d146',
  '43b52840-fd65-48ab-8b8c-0f9d5f746b7c',
  '43b7a3b9-e952-4b88-b491-1bb03c729a96',
  '66ffcfcd-b84e-4e2e-83af-56d84c1a6694',
];

const CUISINE_IDS = [
  '0c9b3c3d-5445-4e6b-9d2c-b61a4d4bb80e',
  '0c4d0afa-3373-4a13-8d93-036f0058b5ad',
  '02f515d1-5440-4133-adb2-bd0ae569e072',
];

const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

/* ─────────────── PROFILE DEFINITIONS ─────────────── */

const profileDefs = [
  {
    name: 'Spice Garden',
    bio: 'Authentic South Asian flavours cooked fresh daily',
    address: '12 Curry Lane, Dhaka',
    phone: '+8801711000001',
    businessEmail: 'spicegarden@example.com',
    openingHours: '09:00',
    closingHours: '22:00',
    deliveryFee: 2.5,
    deliveryTime: 30,
    minimumOrderAmount: 10,
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200',
    cover: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  },
  {
    name: 'Tokyo Bites',
    bio: 'Japanese street food and sushi crafted with precision',
    address: '88 Sakura Street, Chittagong',
    phone: '+8801711000002',
    businessEmail: 'tokyobites@example.com',
    openingHours: '11:00',
    closingHours: '23:00',
    deliveryFee: 3.0,
    deliveryTime: 35,
    minimumOrderAmount: 12,
    logo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200',
    cover: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
  },
  {
    name: 'La Bella Italia',
    bio: 'Homestyle Italian cooking with imported ingredients',
    address: '5 Via Roma, Sylhet',
    phone: '+8801711000003',
    businessEmail: 'labellaitalia@example.com',
    openingHours: '12:00',
    closingHours: '22:30',
    deliveryFee: 2.0,
    deliveryTime: 25,
    minimumOrderAmount: 15,
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
    cover: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  },
  {
    name: 'Burger Republic',
    bio: 'Smash burgers, loaded fries, and thick shakes',
    address: '21 Grill Avenue, Rajshahi',
    phone: '+8801711000004',
    businessEmail: 'burgerrepublic@example.com',
    openingHours: '10:00',
    closingHours: '01:00',
    deliveryFee: 1.5,
    deliveryTime: 20,
    minimumOrderAmount: 8,
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    cover: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  },
  {
    name: 'Green Bowl',
    bio: 'Plant-based meals for a healthier you',
    address: '7 Organic Road, Khulna',
    phone: '+8801711000005',
    businessEmail: 'greenbowl@example.com',
    openingHours: '08:00',
    closingHours: '21:00',
    deliveryFee: 2.0,
    deliveryTime: 25,
    minimumOrderAmount: 10,
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
    cover: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  },
];

/* ─────────────── MEAL CATEGORIES (4 per provider) ─────────────── */

const categoryGroups: Record<
  string,
  { name: string; description: string; imageUrl: string }[]
> = {
  'Spice Garden': [
    {
      name: 'SG Starters',
      description: 'Crispy and spicy openers',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'SG Curries',
      description: 'Rich slow-cooked curries',
      imageUrl:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    },
    {
      name: 'SG Rice Dishes',
      description: 'Biriyani and pilaf',
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'SG Desserts',
      description: 'South Asian sweets',
      imageUrl:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    },
  ],
  'Tokyo Bites': [
    {
      name: 'TB Sushi',
      description: 'Nigiri, maki, and hand rolls',
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
    },
    {
      name: 'TB Ramen',
      description: 'Hot brothy noodle bowls',
      imageUrl:
        'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
    },
    {
      name: 'TB Donburi',
      description: 'Rice bowls with toppings',
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'TB Snacks',
      description: 'Edamame, gyoza, and more',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
  ],
  'La Bella Italia': [
    {
      name: 'LBI Antipasti',
      description: 'Italian starters and boards',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'LBI Pizza',
      description: 'Wood-fired Neapolitan pizzas',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
    {
      name: 'LBI Pasta',
      description: 'Fresh and dried pasta dishes',
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    },
    {
      name: 'LBI Dolci',
      description: 'Italian desserts and gelato',
      imageUrl:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    },
  ],
  'Burger Republic': [
    {
      name: 'BR Burgers',
      description: 'Smash, stacked, and classic',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      name: 'BR Sides',
      description: 'Fries, rings, and slaws',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'BR Shakes',
      description: 'Thick shakes and floats',
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'BR Combos',
      description: 'Meal deals for the family',
      imageUrl:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    },
  ],
  'Green Bowl': [
    {
      name: 'GB Salads',
      description: 'Fresh greens and grain bowls',
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    },
    {
      name: 'GB Wraps',
      description: 'Plant-based wraps and rolls',
      imageUrl:
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    },
    {
      name: 'GB Smoothies',
      description: 'Cold-pressed juices and blends',
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'GB Hot Mains',
      description: 'Warm vegan comfort food',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    },
  ],
};

/* ─────────────── MEALS (4 per provider) ─────────────── */

type MealDef = {
  name: string;
  description: string;
  price: number;
  discount: number | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  isVegan: boolean;
  isBestSeller: boolean;
  preparationTime: number;
  categoryName: string;
  imageUrl: string;
};

const mealGroups: Record<string, MealDef[]> = {
  'Spice Garden': [
    {
      name: 'Chicken Biryani',
      description:
        'Fragrant basmati rice layered with spiced chicken and fried onions',
      price: 12.0,
      discount: 10,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 30,
      categoryName: 'SG Rice Dishes',
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'Lamb Rogan Josh',
      description: 'Slow-braised lamb in a Kashmiri spice gravy',
      price: 14.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 35,
      categoryName: 'SG Curries',
      imageUrl:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    },
    {
      name: 'Samosa Chaat',
      description: 'Crispy samosas topped with tamarind chutney and yoghurt',
      price: 6.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 10,
      categoryName: 'SG Starters',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'Gulab Jamun',
      description:
        'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup',
      price: 4.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 5,
      categoryName: 'SG Desserts',
      imageUrl:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    },
  ],
  'Tokyo Bites': [
    {
      name: 'Dragon Roll',
      description: 'Shrimp tempura, avocado, and spicy mayo inside out roll',
      price: 11.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      categoryName: 'TB Sushi',
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
    },
    {
      name: 'Tonkotsu Ramen',
      description: 'Rich pork bone broth with chashu, egg, and nori',
      price: 13.5,
      discount: 5,
      discountType: 'FIXED_AMOUNT',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      categoryName: 'TB Ramen',
      imageUrl:
        'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
    },
    {
      name: 'Chicken Karaage Bowl',
      description:
        'Crispy Japanese fried chicken over steamed rice with kewpie mayo',
      price: 10.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 18,
      categoryName: 'TB Donburi',
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    },
    {
      name: 'Gyoza (6 pcs)',
      description: 'Pan-fried pork and cabbage dumplings with ponzu dip',
      price: 7.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 12,
      categoryName: 'TB Snacks',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
  ],
  'La Bella Italia': [
    {
      name: 'Bruschetta al Pomodoro',
      description:
        'Grilled sourdough with marinated tomatoes, basil, and garlic',
      price: 7.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 8,
      categoryName: 'LBI Antipasti',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'Quattro Formaggi Pizza',
      description:
        'Four-cheese pizza with mozzarella, gorgonzola, fontina, and parmesan',
      price: 14.0,
      discount: 10,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 20,
      categoryName: 'LBI Pizza',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
    {
      name: 'Tagliatelle al Ragù',
      description: 'Handmade egg ribbons with slow-cooked Bolognese',
      price: 15.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 25,
      categoryName: 'LBI Pasta',
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    },
    {
      name: 'Tiramisu',
      description: 'Classic espresso-soaked ladyfingers with mascarpone cream',
      price: 6.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 5,
      categoryName: 'LBI Dolci',
      imageUrl:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    },
  ],
  'Burger Republic': [
    {
      name: 'Double Smash Burger',
      description:
        'Two smashed beef patties, American cheese, pickles, and special sauce',
      price: 13.5,
      discount: 15,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 15,
      categoryName: 'BR Burgers',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      name: 'Loaded Cheese Fries',
      description:
        'Thick-cut fries smothered with cheese sauce, jalapeños, and bacon',
      price: 8.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: true,
      preparationTime: 10,
      categoryName: 'BR Sides',
      imageUrl:
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    },
    {
      name: 'Oreo Shake',
      description: 'Thick vanilla shake blended with crushed Oreo cookies',
      price: 5.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 5,
      categoryName: 'BR Shakes',
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'Family Combo Meal',
      description: 'Four burgers, four sides, and four drinks at a great price',
      price: 38.0,
      discount: 10,
      discountType: 'FIXED_AMOUNT',
      isVegan: false,
      isBestSeller: false,
      preparationTime: 25,
      categoryName: 'BR Combos',
      imageUrl:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    },
  ],
  'Green Bowl': [
    {
      name: 'Quinoa Power Salad',
      description:
        'Quinoa, roasted chickpeas, kale, avocado, and lemon tahini dressing',
      price: 11.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: true,
      preparationTime: 10,
      categoryName: 'GB Salads',
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    },
    {
      name: 'Falafel Wrap',
      description:
        'Crispy falafel, hummus, pickled cabbage, and harissa in a wholegrain wrap',
      price: 9.0,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: true,
      preparationTime: 12,
      categoryName: 'GB Wraps',
      imageUrl:
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    },
    {
      name: 'Green Detox Smoothie',
      description:
        'Spinach, banana, pineapple, and coconut water cold-pressed blend',
      price: 5.5,
      discount: null,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 5,
      categoryName: 'GB Smoothies',
      imageUrl:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    },
    {
      name: 'Lentil Dhal',
      description:
        'Spiced red lentil stew with coconut milk and toasted cumin, served with flatbread',
      price: 10.0,
      discount: 5,
      discountType: 'PERCENTAGE',
      isVegan: true,
      isBestSeller: false,
      preparationTime: 20,
      categoryName: 'GB Hot Mains',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    },
  ],
};

/* ─────────────── SEED ─────────────── */

const seed = async () => {
  console.log('🌱 Seeding provider profiles, meal categories, and meals...\n');

  const createdProfiles: { id: string; name: string }[] = [];

  // Step 1: Create provider profiles
  console.log('── Provider Profiles ──');
  for (let i = 0; i < USER_IDS.length; i++) {
    const userId = USER_IDS[i];
    const def = profileDefs[i];
    const slug = generateSlug(def.name);

    const existing = await prisma.providerProfile.findFirst({
      where: { OR: [{ ownerId: userId }, { slug }] },
    });

    if (existing) {
      console.log(`⏭️  Skipped profile (already exists): ${def.name}`);
      createdProfiles.push({ id: existing.id, name: existing.name });
      continue;
    }

    const profile = await prisma.providerProfile.create({
      data: {
        name: def.name,
        bio: def.bio,
        address: def.address,
        phone: def.phone,
        businessEmail: def.businessEmail,
        slug,
        logo: def.logo,
        cover: def.cover,
        openingHours: def.openingHours,
        closingHours: def.closingHours,
        isOpen: true,
        deliveryFee: def.deliveryFee,
        deliveryTime: def.deliveryTime,
        minimumOrderAmount: def.minimumOrderAmount,
        ownerId: userId,
        cuisines: {
          connect: CUISINE_IDS.map((id) => ({ id })),
        },
      },
    });

    console.log(`✅ Created profile: ${profile.name} (${profile.id})`);
    createdProfiles.push({ id: profile.id, name: profile.name });
  }

  // Step 2: Create meal categories
  console.log('\n── Meal Categories ──');
  const createdCategories: Record<
    string,
    { id: string; name: string; providerId: string }[]
  > = {};

  for (const profile of createdProfiles) {
    createdCategories[profile.name] = [];
    const cats = categoryGroups[profile.name] ?? [];

    for (const cat of cats) {
      const slug = generateSlug(cat.name);
      const existing = await prisma.mealCategory.findFirst({
        where: { OR: [{ name: cat.name }, { slug }] },
      });

      if (existing) {
        console.log(`⏭️  Skipped category (already exists): ${cat.name}`);
        createdCategories[profile.name].push({
          id: existing.id,
          name: existing.name,
          providerId: existing.providerId,
        });
        continue;
      }

      const created = await prisma.mealCategory.create({
        data: {
          name: cat.name,
          description: cat.description,
          slug,
          imageUrl: cat.imageUrl,
          status: 'ACTIVE',
          providerId: profile.id,
        },
      });

      console.log(`✅ Created category: ${created.name} → ${profile.name}`);
      createdCategories[profile.name].push({
        id: created.id,
        name: created.name,
        providerId: created.providerId,
      });
    }
  }

  // Step 3: Create meals
  console.log('\n── Meals ──');

  for (const profile of createdProfiles) {
    const meals = mealGroups[profile.name] ?? [];
    const profileCats = createdCategories[profile.name] ?? [];

    for (const meal of meals) {
      const slug = generateSlug(meal.name);
      const existing = await prisma.meal.findFirst({
        where: { OR: [{ name: meal.name }, { slug }] },
      });

      if (existing) {
        console.log(`⏭️  Skipped meal (already exists): ${meal.name}`);
        continue;
      }

      const cat =
        profileCats.find((c) => c.name === meal.categoryName) ??
        profileCats[0] ??
        null;

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
          providerId: profile.id,
          mealCategoryId: cat?.id ?? null,
        },
      });

      console.log(
        `✅ Created meal: ${meal.name} → ${profile.name} / ${cat?.name ?? 'no category'}`,
      );
    }
  }

  console.log('\n🎉 All done!');
  await prisma.$disconnect();
};

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
