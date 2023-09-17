import { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { streamToResponse, OpenAIStream } from "ai";
import { openai } from "../lib/openai";
import { text } from "node:stream/consumers";
import { error } from "node:console";

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post("/ai/complete", async (request, response) => {
    const bodySchema = z.object({
      prompt: z.string(),
      videoId: z.string(),
      temperature: z.number().max(1).min(0).default(0.5),
    });

    const { prompt, videoId, temperature } = bodySchema.parse(request.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    if (!video.transcription) {
      return response
        .status(400)
        .send({ error: "Video transcription was not generated yet." });
    }

    const promptMessage = prompt.replace(
      "{transcription}",
      video.transcription
    );

    const completedTextFromAI = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [{ role: "user", content: promptMessage }],
      temperature,
      stream: true,
    });

    const stream = OpenAIStream(completedTextFromAI);

    streamToResponse(stream, response.raw, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  });
}
