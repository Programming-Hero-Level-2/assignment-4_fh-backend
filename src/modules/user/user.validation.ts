import { z } from 'zod';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';

export const Role = {
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(Role),
  status: z.enum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  role: true,
  status: true,
});

export const UpdateUserSchema = UserSchema.partial().pick({
  name: true,
  email: true,
  role: true,
  status: true,
});

export const UserFilterSchema = z
  .object({
    name: z.string(),
    role: z.enum(Role),
    status: z.enum(UserStatus),
  })
  .partial();

export const UserQuerySchema = z
  .object({
    filter: UserFilterSchema,
    pagination: PaginationQuerySchema,
    sort: SortQuerySchema,
  })
  .partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// filter and pagination
export type UserFilter = z.infer<typeof UserFilterSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
