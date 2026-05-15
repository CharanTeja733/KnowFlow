import type { Request, Response, NextFunction } from "express";
import { decodeUserToken } from "../utils/token";
import type { JWTPayload } from "../utils/token";
import { ApiError } from "../utils/ApiError";
export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return next();
  }

  if (!bearerToken.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Token should start with Bearer" });
  }

  const [, token] = bearerToken.split(" ");
  let decoded: JWTPayload;
  try {
    decoded = decodeUserToken(token!);
  } catch {
    return next(new ApiError(400, "invalid json token"));
  }

  req.user = decoded;

  return next();
}

export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new ApiError(401, "you are not logged in"));
  }
  next();
}
