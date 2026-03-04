import { z } from 'zod';

const RegisterSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .refine((name) => name.trim().length > 0, 'Name cannot be empty'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const authValidationSchema = {
  RegisterSchema,
  loginSchema,
};
