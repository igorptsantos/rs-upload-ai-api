import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { prisma } from "./lib/prisma";

import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAICompletionRoute } from "./routes/generate-ai-completion";

const app = fastify();

app.register(fastifyCors, {
  origin: "*", // Em produção, inserir a URL do front-end
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAICompletionRoute);

const startServer = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port });

    console.log(`Listening on port ${port}`);
  } catch (err) {
    console.error(`Failed to start server: ${err}`);
  }
};

startServer();
