import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export async function registerDocumentation(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: { title: "Potion Lab API", version: "1.0.0", description: "Ingredients, brewing and internal AI diagnostics." },
      tags: [
        { name: "Ingredients", description: "Localized ingredient catalog." },
        { name: "Brew", description: "Deterministic brewing rules with a mock AI description." },
        { name: "Internal AI", description: "Protected diagnostics. A check makes a real provider request and consumes quota." },
      ],
      components: {
        securitySchemes: {
          serviceToken: {
            type: "http",
            scheme: "bearer",
            description: "The server's AI_SERVICE_TOKEN. Enter the token without the Bearer prefix."
          },
        },
      },
    },
  })
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true, persistAuthorization: false },
    staticCSP: true,
  })
}
