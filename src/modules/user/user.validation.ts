import { z } from 'zod';

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
  password: true,
  role: true,
  status: true,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
