import { FastifyInstance } from "fastify";
import { redis } from "../lib/redis.js";

export default async function routes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    // TODO: implement
    reply.code(501).send({ error: "Not implemented" });
  });
}
