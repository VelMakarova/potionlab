import Fastify, { type FastifyServerOptions } from 'fastify';
import { apiRoutes } from './routes/routes.js';
import { registerDocumentation } from './swagger.js';

export async function createApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: [
        'req.headers.authorization',
        'req.headers["x-goog-potionlab-api-key"]',
        'req.headers.cookie',
      ],
    },
    ...options,
  });

  await registerDocumentation(app);
  await app.register(apiRoutes);

  return app;
}
