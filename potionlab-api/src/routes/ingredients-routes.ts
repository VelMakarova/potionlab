import type { FastifyPluginAsync } from 'fastify';
import {
  type LanguageQuery,
  registerRequestLanguage,
} from '@/hooks/language.js';
import { languageQuerySchema } from '@/schemas/language.js';
import {
  commonResponses,
  elements,
  ingredientListSchema,
  ingredientSchema,
} from '@/schemas/common.js';
import {
  getIngredients,
  getIngredientById,
  getIngredientsByElement,
} from '@/services/ingredients.js';
import type { Element } from '@/types/index.js';

export const ingredientsRoutes: FastifyPluginAsync = async (fastify) => {
  registerRequestLanguage(fastify);

  fastify.get<{ Querystring: LanguageQuery }>(
    '/ingredients',
    {
      schema: {
        tags: ['Ingredients'],
        summary: 'Get all ingredients',
        querystring: languageQuerySchema,
        response: {
          ...commonResponses,
          200: {
            ...ingredientListSchema,
            description: 'All ingredients in the selected language.',
          },
        },
      },
    },
    async (request) => {
      return getIngredients(request.language);
    }
  );

  fastify.get<{
    Params: { element: Element };
    Querystring: LanguageQuery;
  }>(
    '/ingredients/element/:element',
    {
      schema: {
        tags: ['Ingredients'],
        summary: 'Get ingredients by element',
        querystring: languageQuerySchema,
        response: {
          ...commonResponses,
          200: {
            ...ingredientListSchema,
            description: 'Ingredients matching the element (may be empty).',
          },
        },
        params: {
          type: 'object',
          required: ['element'],
          properties: { element: { type: 'string', enum: elements } },
        },
      },
    },
    async (request) => {
      return getIngredientsByElement(request.params.element, request.language);
    }
  );

  fastify.get<{
    Params: { id: string };
    Querystring: LanguageQuery;
  }>(
    '/ingredients/:id',
    {
      schema: {
        tags: ['Ingredients'],
        summary: 'Get an ingredient by ID',
        querystring: languageQuerySchema,
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              description: 'Ingredient ID.',
              examples: ['dragon-scale'],
            },
          },
        },
        response: {
          ...commonResponses,
          200: {
            ...ingredientSchema,
            description: 'Ingredient in the selected language.',
          },
          404: {
            description: 'Ingredient ID was not found.',
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string', examples: ['Ingredient not found'] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const ingredient = getIngredientById(request.params.id, request.language);

      if (!ingredient) {
        return reply.code(404).send({ message: 'Ingredient not found' });
      }

      return ingredient;
    }
  );
};
