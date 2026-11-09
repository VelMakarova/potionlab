import type {FastifyPluginAsync} from "fastify";
import { ingredientsRoutes } from "@/routes/ingredients-routes.js";
import { aiRoutes } from "@/routes/ai-routes.js";
import { brewRoutes } from "@/routes/brew-routes.js";

export const apiRoutes: FastifyPluginAsync = async (app) => {
  app.register(ingredientsRoutes);
  app.register(brewRoutes);
  app.register(aiRoutes);
}
