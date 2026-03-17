import Redis from 'ioredis';
import { loadConfig } from './config.js';

const config = await loadConfig();
export const redis = new Redis({ host: config.redis.host, port: config.redis.port });