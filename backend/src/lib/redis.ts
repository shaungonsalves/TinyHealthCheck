import Redis from "ioredis";

const host = process.env.REDIS_HOST || "localhost";
export const redis = new Redis({ host });