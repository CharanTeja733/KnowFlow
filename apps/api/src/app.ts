import express from "express";
import { registerRoutes } from "./routes";

import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error.middlewares";

import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { globalLimiter } from "./middlewares/ratelimiter";
import { authenticationMiddleware } from "./middlewares/authentication.middlewares";

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
