import z from 'zod';
import { DEFAULT_PAGE_SIZE } from '../../constants';

export const PaginationQuerySchema = z
  .object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
  })
  .partial();

export const PaginationMetaSchema = z.object({
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  next: z.number().nullable(),
  prev: z.number().nullable(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
