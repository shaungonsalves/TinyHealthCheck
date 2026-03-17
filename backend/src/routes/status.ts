import type { FastifyInstance } from "fastify";
import { redis } from "../lib/redis.ts"; // .ts extension

export default async function routes(app: FastifyInstance) {
  app.get("/", async () => {
    const urls = await redis.smembers("targets:set");
    const results: Record<string, any> = {};

    for (const url of urls) {
      const data = await redis.hgetall(`status:${url}`);
      if (data && Object.keys(data).length) {
        results[url] = {
          up: data.up === "true",
          latency: data.latency ? Number(data.latency) : null,
          lastChecked: data.lastChecked,
        };
      } else {
        results[url] = { up: null, latency: null, lastChecked: null };
      }
    }

    return results;
  });
}
