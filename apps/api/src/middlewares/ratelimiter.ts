import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "@repo/redis/client";
import type { Request, Response } from "express";

/**
 * Redis command adapter
 */
const sendRedisCommand = (...args: string[]) =>
  redisClient.call(args[0]!, ...args.slice(1)) as Promise<unknown> as Promise<
    import("rate-limit-redis").RedisReply
  >;

/**
 * Shared Redis store
 */
const redisStore = new RedisStore({
  sendCommand: sendRedisCommand,
});

/**
 * Shared config
 */
const commonConfig = {
  store: redisStore,

  standardHeaders: true,
  legacyHeaders: false,

  /**
   * Logged-in users → userId
   * Anonymous users → IP
   */
  keyGenerator: (req: Request) => {
    return req.user?.id ?? req.ip ?? "unknown-ip";
  },

  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
};

/**
 * Global API limiter
 */
export const globalLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Login protection
 */
export const loginLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 5,
});

/**
 * Forgot password protection
 */
export const forgotPasswordLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 3,
});

/**
 * Upload protection
 */
export const uploadLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 20,
});
