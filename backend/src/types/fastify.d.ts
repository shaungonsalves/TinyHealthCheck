import { Redis } from 'ioredis';
import { Config } from '../lib/config.js'; // Adjust path if needed

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
    sub: Redis;
    pub: Redis;
    config: Config;
  }
}