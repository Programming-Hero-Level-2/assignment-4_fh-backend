import dotenv from 'dotenv';
import path from 'path';
import { ENV } from './env';

dotenv.config({ path: path.join(process.cwd(), '.env'), debug: true });

export default {
  port: ENV.PORT,
  database_url: process.env.DATABASE_URL,
};
