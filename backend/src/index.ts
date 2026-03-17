import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse-v2";

const app = Fastify({ logger: true });

await app.register(cors);
await app.register(sse);

// Register routes
app.register(import("./routes/targets.js"), { prefix: "/targets" });
app.register(import("./routes/status.js"), { prefix: "/status" });
app.register(import("./routes/events.js"), { prefix: "/events" });

app.listen({ port: 8080, host: "0.0.0.0" });
