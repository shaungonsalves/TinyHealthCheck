import type { FastifyInstance } from "fastify";
import Redis from "ioredis";

export default async function routes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders?.();

    reply.sse({ data: "connected" });

    const subscriber = new Redis({ host: process.env.REDIS_HOST || "localhost" });

    await subscriber.subscribe("health:update");

    const handler = (_channel: string, message: string) => {
      reply.sse({ data: message });
    };

    subscriber.on("message", handler);

    req.raw.on("close", async () => {
      subscriber.off("message", handler);
      await subscriber.unsubscribe("health:update");
      subscriber.disconnect();
    });
  });
}