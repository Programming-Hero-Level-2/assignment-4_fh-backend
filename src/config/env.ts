import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, 'ACCESS_TOKEN_SECRET must be required'),
  TOKEN_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string(),
  ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD must be at least 6 chars'),
  ADMIN_NAME: z.string().min(1, 'ADMIN_NAME is required'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables', env.error.format());
  process.exit(1);
}

export const ENV = {
  NODE_ENV: env.data.NODE_ENV,
  PORT: Number(env.data.PORT),
  DATABASE_URL: env.data.DATABASE_URL,
  CORS_ORIGIN: env.data.CORS_ORIGIN,
  ACCESS_TOKEN_SECRET: env.data.ACCESS_TOKEN_SECRET,
  TOKEN_EXPIRES_IN: env.data.TOKEN_EXPIRES_IN,
  ADMIN_EMAIL: env.data.ADMIN_EMAIL,
  ADMIN_PASSWORD: env.data.ADMIN_PASSWORD,
  ADMIN_NAME: env.data.ADMIN_NAME,
} as const;
