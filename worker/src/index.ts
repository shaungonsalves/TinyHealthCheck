import Redis from "ioredis";
import Queue from "bull";
import pino from "pino";
import { loadConfig } from "./lib/config.ts";

const config = await loadConfig();

const logger = pino({
    level: config.logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
});

const redisHost = config.redis.host;
const redisPort = config.redis.port;

let healthCheckQueue: Queue.Queue | null = null;
let currentInterval: number = config.checkInterval;

const processJob = async (job: Queue.Job) => {
    logger.info({ jobId: job.id }, "Running health checks");
    const redis = new Redis({ host: redisHost, port: redisPort });
    const pub = new Redis({ host: redisHost, port: redisPort });

    try {
        const urls = await redis.smembers("targets:set");
        for (const url of urls) {
            const start = Date.now();
            let up = false;
            let error: string | undefined;
            try {
                const res = await fetch(url, { method: "HEAD" });
                up = res.ok;
                if (!res.ok) error = `HTTP ${res.status}`;
            } catch (err: any) {
                error = err.message;
            }
            const latency = Date.now() - start;
            const lastChecked = new Date().toISOString();

            await redis.hset(`status:${url}`, {
                up: up ? "true" : "false",
                latency: latency.toString(),
                lastChecked,
            });

            await pub.publish("health:update", JSON.stringify({ url, up, latency, lastChecked }));
            logger.info({ url, up, latency, error }, "Health check completed");
        }
    } finally {
        await redis.quit();
        await pub.quit();
    }
};

async function getIntervalFromRedis(): Promise<number> {
    const redis = new Redis({ host: redisHost, port: redisPort });
    const interval = await redis.get("config:check_interval");
    await redis.quit();
    return interval ? parseInt(interval) : config.checkInterval;
}

async function setupScheduler(interval: number) {
  if (healthCheckQueue) {
    const repeatableJobs = await healthCheckQueue.getRepeatableJobs();
    await Promise.all(repeatableJobs.map(job => healthCheckQueue!.removeRepeatableByKey(job.key)));
  } else {
    healthCheckQueue = new Queue("health-checks", {
      redis: { host: redisHost, port: redisPort }
    });
    healthCheckQueue.process("check-all", processJob); // ✅ only here
  }

  await healthCheckQueue.add(
    "check-all",
    {},
    { repeat: { every: interval }, removeOnComplete: true, removeOnFail: false }
  );
  logger.info({ interval }, "Scheduled health checks");
}

async function initialize() {
    currentInterval = await getIntervalFromRedis();
    await setupScheduler(currentInterval);
}

// Listen for config updates
const subscriber = new Redis({ host: redisHost, port: redisPort });
subscriber.subscribe("config:update", (err) => {
    if (err) logger.error({ err }, "Failed to subscribe to config:update");
});

subscriber.on("message", async (channel, message) => {
    if (channel === "config:update") {
        try {
            const { interval } = JSON.parse(message);
            currentInterval = interval;
            await setupScheduler(interval);
            logger.info({ interval }, "Updated check interval from config update");
        } catch (e) {
            logger.error({ err: e }, "Failed to process config update");
        }
    }
});

// Start
initialize().catch(err => {
    logger.fatal({ err }, "Failed to start worker");
    process.exit(1);
});

process.on("SIGTERM", async () => {
    await healthCheckQueue?.close();
    await subscriber.quit();
    process.exit(0);
});
