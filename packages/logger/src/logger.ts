import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  /**
   * Hide sensitive values
   */
  redact: {
    paths: [
      "password",
      "refreshToken",
      "accessToken",
      "authorization",
      "email",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },

  /**
   * Development formatting
   */
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  timestamp: pino.stdTimeFunctions.isoTime,
});
