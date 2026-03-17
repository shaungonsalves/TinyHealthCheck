import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse-v2";
import Redis from "ioredis";
import { loadConfig } from "./lib/config.ts";
import { loadRoutes } from "./lib/pluginLoader.ts";
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { Queue as BullMQ } from 'bullmq';

const config = await loadConfig();

const app = Fastify({ logger: { level: config.logLevel } });

const redis = new Redis(config.redis);
const sub = new Redis(config.redis);
const pub = new Redis(config.redis);
app.decorate('config', config);
app.decorate('redis', redis);
app.decorate('sub', sub);
app.decorate('pub', pub);

// Bull-board setup
const serverAdapter = new FastifyAdapter();
const healthCheckQueue = new BullMQ('health-checks', { connection: config.redis });
createBullBoard({
    queues: [new BullMQAdapter(healthCheckQueue)],
    serverAdapter,
});
serverAdapter.setBasePath('/admin/queues');
app.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });

await app.register(cors);
await app.register(sse);

await loadRoutes(app, "routes");

app.listen({ port: config.server.port, host: config.server.host }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});

app.addHook('onClose', async (instance) => {
    await instance.redis.quit();
    await instance.sub.quit();
    await instance.pub.quit();
});
