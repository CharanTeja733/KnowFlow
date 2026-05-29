import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number(),

  FRONTEND_URL: z.url(),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_HOST: z.string(),

  REDIS_PORT: z.coerce.number(),

  // OpenAI
  OPENAI_API_KEY: z.string(),

  // AWS
  AWS_ACCESS_KEY_ID: z.string(),

  AWS_SECRET_ACCESS_KEY: z.string(),

  AWS_REGION: z.string(),

  AWS_S3_BUCKET: z.string(),

  // JWT
  JWT_ACCESS_SECRET: z.string(),

  JWT_REFRESH_SECRET: z.string(),

  JWT_ACCESS_EXPIRES_IN: z.custom<`${number}${string}`>(),

  JWT_REFRESH_EXPIRES_IN: z.custom<`${number}${string}`>(),

  // Cookies
  ACCESS_COOKIE_MAX_AGE: z.coerce.number(),
  REFRESH_COOKIE_MAX_AGE: z.coerce.number(),
  COOKIE_DOMAIN: z.string(),

  //SSE
  SSE_HEARTBEAT_INTERVAL_MS: z.coerce.number(),

  // AI Processing
  AI_CONCURRENCY: z.coerce.number(),

  AI_TIMEOUT_MS: z.coerce.number(),

  CHUNK_SIZE: z.coerce.number(),

  CHUNK_OVERLAP: z.coerce.number(),

  // file upload
  MAX_FILE_SIZE: z.coerce.number(),

  //Email
  RESEND_API_KEY: z.string(),

  EMAIL_VERIFICATION_EXPIRES_MS: z.coerce.number(),

  EMAIL_FROM_ADDRESS: z.email(),

  //Workers
  WORKER_CONCURRENCY: z.coerce.number(),
});

export const env = envSchema.parse(process.env);
