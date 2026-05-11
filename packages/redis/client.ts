import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(redisConfig);

// For publishing events
export const publisher = new Redis(redisConfig);

// For subscribing to events
export const subscriber = new Redis(redisConfig);