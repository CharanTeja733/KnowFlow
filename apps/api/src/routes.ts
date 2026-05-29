import type { Express } from "express";
import authRouter from "./modules/auth/auth.routes";
import documentRouter from "./modules/document/document.routes";
import realtimeRouter from "./modules/realtime/realtime.routes";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/document", documentRouter);
  app.use("/api/realtime", realtimeRouter);
}
