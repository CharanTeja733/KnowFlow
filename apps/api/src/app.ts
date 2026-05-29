import express from "express";
import { registerRoutes } from "./routes";
import healthRouter from "./modules/health/health.routes";

import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error.middlewares";

import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { globalLimiter } from "./middlewares/ratelimiter";
import { authenticationMiddleware } from "./middlewares/authentication.middlewares";
import { requestLogger } from "./middlewares/request-logger.middlewares";

import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

/**
 * Required behind proxies
 */
app.set("trust proxy", 1);

/**
 * Request tracing
 */
app.use(requestIdMiddleware);

/**
 * Security headers
 */
app.use(helmet());

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

/**
 * Health route
 *
 * MUST come before global limiter
 */
app.use("/api/health", healthRouter);

/**
 * Parse request body
 */
app.use(
  express.json({
    limit: "10kb",
  }),
);

/**
 * Parse cookies
 */
app.use(cookieParser());

/**
 * request logger
 */
app.use(requestLogger);
/**
 * Global rate limiting
 */
app.use(globalLimiter);

/**
 * Populate req.user if token exists
 */
app.use(authenticationMiddleware);

/**
 * Routes
 */
registerRoutes(app);

/**
 * Fallbacks
 */
app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
