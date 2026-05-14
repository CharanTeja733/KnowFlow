import Redis from "ioredis";
import { env } from "@repo/env";

export const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(redisConfig);

// For publishing events
export const publisher = new Redis(redisConfig);

// For subscribing to events
export const subscriber = new Redis(redisConfig);
