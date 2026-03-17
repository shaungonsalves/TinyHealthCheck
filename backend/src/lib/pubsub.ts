import Redis from 'ioredis';
import { loadConfig } from './config.js';

const config = await loadConfig();
export const sub = new Redis({ host: config.redis.host, port: config.redis.port });
export const pub = new Redis({ host: config.redis.host, port: config.redis.port });