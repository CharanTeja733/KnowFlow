import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "@repo/redis/client";

const sendRedisCommand = (...args: string[]) =>
  redisClient.call(args[0]!, ...args.slice(1)) as Promise<unknown> as Promise<
    import("rate-limit-redis").RedisReply
  >;

/**
 * Global API Rate Limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 100, // max requests per window per key

  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false, // disable old headers

  /**
   * Redis store (shared across all instances)
   */
  store: new RedisStore({
    sendCommand: sendRedisCommand,
  }),

  /**
   * Unique identifier (IP or user)
   */
  keyGenerator: (req) => {
    return req.ip ?? ""; // express types allow undefined
  },

  /**
   * Custom error response
   */
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  store: new RedisStore({
    sendCommand: sendRedisCommand,
  }),

  message: "Too many login attempts",
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,

  store: new RedisStore({
    sendCommand: sendRedisCommand,
  }),

  message: "Too many requests",
});
