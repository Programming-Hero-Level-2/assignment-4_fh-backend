import { z } from 'zod';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';

export const MealStatus = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;
export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;
export const CategoryStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

/* ---------- MealCategory ---------- */
export const MealCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  slug: z.string().min(2),
  imageUrl: z.url().optional().nullable(),
  status: z.enum(CategoryStatus).default(CategoryStatus.ACTIVE),
  providerId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateMealCategorySchema = MealCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({ slug: true, providerId: true });

export const UpdateMealCategorySchema = CreateMealCategorySchema.omit({
  providerId: true,
}).partial();

export const UpdateMealCategoryStatusSchema = z.object({
  status: z.enum(CategoryStatus),
});

export const MealCategoryQuerySchema = z
  .object({
    filter: z
      .object({ name: z.string(), status: z.enum(CategoryStatus) })
      .partial()
      .optional(),
    pagination: PaginationQuerySchema.optional(),
    sort: SortQuerySchema.optional(),
  })
  .partial();

/* ---------- Meal ---------- */
export const MealSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  slug: z.string().min(2),
  price: z.number().positive(),
  discount: z.number().nonnegative().optional().nullable(),
  discountType: z.enum(DiscountType).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(MealStatus).default(MealStatus.AVAILABLE),
  isVegan: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  preparationTime: z.number().int().positive().optional().nullable(),
  providerId: z.uuid(),
  mealCategoryId: z.uuid().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateMealSchema = MealSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({ slug: true });

export const UpdateMealSchema = CreateMealSchema.omit({
  providerId: true,
}).partial();

export const UpdateMealStatusSchema = z.object({
  status: z.enum(MealStatus),
});

export const MealQuerySchema = z
  .object({
    filter: z
      .object({
        name: z.string(),
        status: z.enum(MealStatus),
        isVegan: z.boolean(),
        isBestSeller: z.boolean(),
        mealCategoryId: z.uuid(),
      })
      .partial()
      .optional(),
    pagination: PaginationQuerySchema.optional(),
    sort: SortQuerySchema.optional(),
  })
  .partial();

export type MealCategory = z.infer<typeof MealCategorySchema>;
export type CreateMealCategory = z.infer<typeof CreateMealCategorySchema>;
export type UpdateMealCategory = z.infer<typeof UpdateMealCategorySchema>;
export type UpdateMealCategoryStatus = z.infer<
  typeof UpdateMealCategoryStatusSchema
>;
export type MealCategoryQuery = z.infer<typeof MealCategoryQuerySchema>;

export type Meal = z.infer<typeof MealSchema>;
export type CreateMeal = z.infer<typeof CreateMealSchema>;
export type UpdateMeal = z.infer<typeof UpdateMealSchema>;
export type UpdateMealStatus = z.infer<typeof UpdateMealStatusSchema>;
export type MealQuery = z.infer<typeof MealQuerySchema>;
