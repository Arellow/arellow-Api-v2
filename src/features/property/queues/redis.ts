import { RedisOptions } from 'ioredis';

export const redisConnection: RedisOptions = {
  // host: process.env.REDIS_HOST || '127.0.0.1',
  // port: parseInt(process.env.REDIS_PORT || '6379', 10),
  // password: process.env.REDIS_PASSWORD || undefined,
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '11071', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
};

console.log({redisConnection})



