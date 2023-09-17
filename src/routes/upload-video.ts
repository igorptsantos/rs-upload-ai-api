import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { prisma } from "../lib/prisma";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

const pump = promisify(pipeline);

const MEGABYTE = 1_048_576;

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: MEGABYTE * 25, // 25 MB
    },
  });

  app.post("/videos", async (request, response) => {
    const data = await request.file();
    if (!data) {
      return response.status(400).send({ error: "Missing file input." });
    }

    const extension = path.extname(data.filename);

    if (extension !== ".mp3") {
      return response
        .status(404)
        .send({ error: "Invalid input type. Please upload an mp3 file" });
    }

    const fileBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

    const uploadDestination = path.resolve(
      __dirname,
      "../../temp",
      fileUploadName
    );

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    });
    return response.status(200).send(video);
  });
}
