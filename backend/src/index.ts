import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse-v2";
import Redis from "ioredis";
import { loadConfig } from "./lib/config.js";
import { loadRoutes } from "./lib/pluginLoader.js";

const config = await loadConfig();

const app = Fastify({ logger: { level: config.logLevel } });

const redis = new Redis(config.redis);
const sub = new Redis(config.redis);
const pub = new Redis(config.redis);
app.decorate('config', config);
app.decorate('redis', redis);
app.decorate('sub', sub);
app.decorate('pub', pub);

await app.register(cors);
await app.register(sse);

await loadRoutes(app, "routes");

app.listen({ port: config.server.port, host: config.server.host }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});