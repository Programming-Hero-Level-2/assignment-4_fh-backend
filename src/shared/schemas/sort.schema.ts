import z from 'zod';

export enum SORT_TYPE {
  ASC = 'asc',
  DESC = 'desc',
}
export enum SORT_BY {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  EMAIL = 'email',
}

export const SortQuerySchema = z
  .object({
    sortBy: z.enum(SORT_BY).default(SORT_BY.CREATED_AT),
    sortType: z.enum(SORT_TYPE).default(SORT_TYPE.DESC),
  })
  .partial();

export type SortQuery = z.infer<typeof SortQuerySchema>;
