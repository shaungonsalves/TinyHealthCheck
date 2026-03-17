import { FastifyInstance } from "fastify";
import { sub } from "../lib/pubsub.js";

export default async function routes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    reply.sse({ data: "connected" });

    await sub.subscribe("health:update");

    sub.on("message", (_channel, message) => {
      reply.sse({ data: message });
    });
  });
}
