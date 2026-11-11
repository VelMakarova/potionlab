import type { FastifyInstance } from 'fastify';

export type Language = 'en' | 'ua';
export type LanguageQuery = { lang?: Language };

declare module 'fastify' {
  interface FastifyRequest {
    language: Language;
  }
}

export function registerRequestLanguage(fastify: FastifyInstance) {
  fastify.decorateRequest('language', 'en');

  // Runs after query validation, before the route handler.
  fastify.addHook('preHandler', async (request) => {
    const query = request.query as LanguageQuery;
    request.language = query.lang ?? 'en';
  });
}
