import rateLimit, { ipKeyGenerator } from "express-rate-limit";

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
 * Create isolated Redis store
 */
function createRedisStore(prefix: string) {
  return new RedisStore({
    prefix,

    sendCommand: sendRedisCommand,
  });
}

/**
 * Shared key generator
 *
 * Logged-in users → userId
 * Anonymous users → normalized IP
 */
function keyGenerator(req: Request) {
  return req.user?.userId ?? ipKeyGenerator(req.ip!);
}

/**
 * Shared handler
 */
function handler(req: Request, res: Response) {
  return res.status(429).json({
    success: false,

    message: "Too many requests. Please try again later.",
  });
}

/**
 * Global API limiter
 */
export const globalLimiter = rateLimit({
  store: createRedisStore("rl:global:"),

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator,

  handler,

  windowMs: 15 * 60 * 1000,

  max: 100,
});

/**
 * Login protection
 */
export const loginLimiter = rateLimit({
  store: createRedisStore("rl:login:"),

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator,

  handler,

  windowMs: 15 * 60 * 1000,

  max: 50,
});

/**
 * Forgot password protection
 */
export const forgotPasswordLimiter = rateLimit({
  store: createRedisStore("rl:forgot-password:"),

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator,

  handler,

  windowMs: 15 * 60 * 1000,

  max: 3,
});

/**
 * Upload protection
 */
export const uploadLimiter = rateLimit({
  store: createRedisStore("rl:upload:"),

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator,

  handler,

  windowMs: 15 * 60 * 1000,

  max: 20,
});
