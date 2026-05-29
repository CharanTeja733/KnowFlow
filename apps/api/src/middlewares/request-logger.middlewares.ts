import type { Request, Response, NextFunction } from "express";
import { logger } from "@repo/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  /**
   * Attach request-scoped logger
   */
  req.log = logger.child({
    requestId: req.requestId,
  });

  res.on("finish", () => {
    req.log.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      },
      "Request completed",
    );
  });

  next();
}
