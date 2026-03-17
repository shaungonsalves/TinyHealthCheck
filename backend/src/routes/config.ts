import type { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.post<{ Body: { interval: number } }>("/interval", async (req, reply) => {
    const { interval } = req.body;

    if (!interval || interval < 5000 || interval > 300000) {
      return reply.code(400).send({ error: "Interval must be between 5 and 300 seconds" });
    }

    // Store in Redis
    await app.redis.set("config:check_interval", interval);

    // Notify worker via pub/sub
    await app.pub.publish("config:update", JSON.stringify({ interval }));

    app.log.info({ interval }, "Check interval updated");
    reply.send({ interval });
  });
}