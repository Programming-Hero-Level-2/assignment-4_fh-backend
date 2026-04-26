import { z } from 'zod';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';

export const ReviewSchema = z.object({
  id: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
  orderId: z.uuid(),
  userId: z.uuid(),
  providerId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReviewSchema = z.object({
  orderId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(500),
});

export const ReviewQuerySchema = z
  .object({
    filter: z
      .object({
        rating: z.number().int().min(1).max(5),
      })
      .partial()
      .optional(),
    pagination: PaginationQuerySchema.optional(),
    sort: SortQuerySchema.optional(),
  })
  .partial();

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type ReviewQuery = z.infer<typeof ReviewQuerySchema>;
