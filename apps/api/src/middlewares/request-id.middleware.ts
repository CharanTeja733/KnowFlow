import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = crypto.randomUUID();

  req.requestId = requestId;

  // useful for frontend/debugging
  res.setHeader("X-Request-Id", requestId);

  next();
}
