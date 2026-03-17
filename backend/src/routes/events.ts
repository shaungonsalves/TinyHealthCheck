import type { FastifyInstance } from "fastify";
import Redis from "ioredis";

export default async function routes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders?.();

    reply.sse({ data: "connected" });
    app.log.info("SSE client connected");

    // Create a dedicated subscriber for this connection using config
    const subscriber = new Redis(app.config.redis);
    await subscriber.subscribe("health:update");

    const handler = (channel: string, message: string) => {
      app.log.debug(`SSE sending: ${message}`);
      reply.sse({ data: message });
    };
    subscriber.on("message", handler);

    // Heartbeat
    const heartbeat = setInterval(() => {
      reply.raw.write(": heartbeat\n\n");
    }, 15000);

    req.raw.on("close", () => {
      app.log.info("SSE client disconnected");
      subscriber.off("message", handler);
      subscriber.unsubscribe("health:update");
      subscriber.disconnect();
      clearInterval(heartbeat);
    });
  });
}