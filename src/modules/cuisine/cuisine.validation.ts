import { z } from 'zod';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';

export const CategoryStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const CuisineSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  status: z.enum(CategoryStatus).default(CategoryStatus.ACTIVE),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCuisineSchema = CuisineSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z
    .string()
    .min(2)
    .optional()
    .transform((val, ctx) => {
      // auto-generate slug from name if not provided - handled in service
      return val;
    }),
});

export const UpdateCuisineSchema = CreateCuisineSchema.partial();

export const UpdateCuisineStatusSchema = z.object({
  status: z.enum(CategoryStatus),
});

export const CuisineFilterSchema = z
  .object({
    name: z.string(),
    status: z.enum(CategoryStatus),
  })
  .partial();

export const CuisineQuerySchema = z
  .object({
    filter: CuisineFilterSchema,
    pagination: PaginationQuerySchema,
    sort: SortQuerySchema,
  })
  .partial();

export type Cuisine = z.infer<typeof CuisineSchema>;
export type CreateCuisine = z.infer<typeof CreateCuisineSchema>;
export type UpdateCuisine = z.infer<typeof UpdateCuisineSchema>;
export type UpdateCuisineStatus = z.infer<typeof UpdateCuisineStatusSchema>;
export type CuisineFilter = z.infer<typeof CuisineFilterSchema>;
export type CuisineQuery = z.infer<typeof CuisineQuerySchema>;
