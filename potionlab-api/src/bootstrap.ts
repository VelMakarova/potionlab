import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { z } from 'zod';
import { createApp } from './app.js';

if (existsSync('.env')) loadEnvFile('.env');

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  NODE_ENV: z.enum(['production', 'development']).default('development'),
});

const { PORT } = envSchema.parse(process.env);

const app = await createApp();

const bootstrap = async () => {
  try {
    await app.listen({ port: PORT });
    app.log.info('Server is running');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

bootstrap();
