import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.post<{ Body: { url: string } }>("/", async (req, reply) => {
    const { url } = req.body;

    if (!url) {
      return reply.code(400).send({ error: "URL required" });
    }

    try {
      new URL(url);
    } catch {
      return reply.code(400).send({ error: "Invalid URL" });
    }

    const exists = await app.redis.sismember("targets:set", url);
    if (exists) {
      return reply.code(409).send({ error: "URL already tracked" });
    }

    await app.redis.sadd("targets:set", url);
    reply.code(201).send({ url });
  });
}