import { z } from 'zod';
import { Role, UserStatus } from '../user/user.validation';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';
import { CuisineSchema } from '../cuisine/cuisine.validation';

export const ProviderProfileSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .refine((value) => value.trim() !== '', {
      message: 'Name cannot be empty',
    }),
  businessEmail: z.email().nullable().optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  slug: z
    .string()
    .min(3)
    .optional()
    .transform((val, ctx) => {
      // auto-generate slug from name if not provided - handled in service
      return val;
    }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters long' })
    .refine((value) => value.trim() !== '', {
      message: 'Address cannot be empty',
    }),
  logo: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  openingHours: z.string().refine((value) => value.trim() !== '', {
    message: 'Opening hours cannot be empty',
  }),
  closingHours: z.string().refine((value) => value.trim() !== '', {
    message: 'Closing hours cannot be empty',
  }),
  isOpen: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  deliveryFee: z
    .number()
    .nonnegative('Delivery fee must be a non-negative number'),
  deliveryTime: z
    .number()
    .nonnegative('Delivery time must be a non-negative number'),
  minimumOrderAmount: z.number().positive().default(1),
  owner: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    role: z.enum(Role),
    status: z.enum(UserStatus),
  }),
  cuisines: CuisineSchema.pick({ id: true, name: true }).array().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProviderProfileSchema = ProviderProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  owner: true,
  slug: true,
  cuisines: true,
}).extend({
  cuisineIds: z.array(z.uuid()).optional(),
});

export const UpdateProviderProfileSchema =
  CreateProviderProfileSchema.partial();

export const ProviderFilterSchema = z
  .object({
    name: z.string(),
    isOpen: z.boolean(),
    category: z.array(z.string()),
    isVeg: z.boolean(),
    rating: z.number().min(1).max(5),
    priceRange: z.enum(['budget', 'mid', 'premium']),
    maxDeliveryTime: z.number().positive(),
  })
  .partial();

export const ProviderQuerySchema = z
  .object({
    filter: ProviderFilterSchema,
    pagination: PaginationQuerySchema,
    sort: SortQuerySchema,
  })
  .partial();

export type ProviderProfile = z.infer<typeof ProviderProfileSchema>;
export type CreateProviderProfile = z.infer<typeof CreateProviderProfileSchema>;
export type UpdateProviderProfile = z.infer<typeof UpdateProviderProfileSchema>;
export type ProviderFilter = z.infer<typeof ProviderFilterSchema>;
export type ProviderQuery = z.infer<typeof ProviderQuerySchema>;
