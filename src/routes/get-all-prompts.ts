import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

/** O Fastify exige que os módulos cadastrados com register sejam assíncronos */
export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get("/prompts", async () => {
    const prompts = await prisma.prompt.findMany({
      orderBy: { title: "asc" },
    });

    return prompts;
  });
}
