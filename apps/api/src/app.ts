import express from "express";
import { registerRoutes } from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.middlewares";
import { globalLimiter } from "./middlewares/ratelimiter";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.set("trust proxy", 1)
app.use(helmet())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(globalLimiter);
app.use(express.json({limit: '10kb'}));

registerRoutes(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;