import type {FastifyPluginAsync} from "fastify";
import {type LanguageQuery, registerRequestLanguage} from "@/hooks/language.js";
import {languageQuerySchema} from "@/schemas/language.js";
import {bodyErrorResponses, commonResponses, ingredientIdsSchema} from "@/schemas/common.js";
import { brewResultSchema } from "../schemas/brew.js";
import { BrewInputError } from "../domain/brewing.js";
import { brewPotion, UnknownIngredientError } from "../services/brew.js";

export const brewRoutes: FastifyPluginAsync = async (app) => {
  registerRequestLanguage(app);

  app.post<{ Querystring: LanguageQuery; Body: { ingredientIds: [string, string, string] } }>("/brew", {
    schema: {
      tags: ["Brew"], summary: "Brew a potion from three distinct ingredients",
      description: "Validates catalog IDs and applies deterministic brewing rules. Successful brews return a localized mock AI description; no AI request is made.",
      querystring: languageQuerySchema,
      response: {
        ...commonResponses, ...bodyErrorResponses,
        200: brewResultSchema,
      },
      body: {
        type: "object",
        required: ["ingredientIds"],
        properties: {
          ingredientIds: ingredientIdsSchema,
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await brewPotion(request.body.ingredientIds, request.language);
    } catch (error) {
      if (!(error instanceof BrewInputError) && !(error instanceof UnknownIngredientError)) throw error;
      return reply.code(400).send({
        statusCode: 400, error: "Bad Request", code: error.code, message: error.message,
      });
    }
  });
}
