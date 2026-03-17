import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse-v2";
import { loadRoutes } from "./lib/pluginLoader.ts";
const app = Fastify({ logger: true });

await app.register(cors);
await app.register(sse);

await loadRoutes(app, "routes");

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});