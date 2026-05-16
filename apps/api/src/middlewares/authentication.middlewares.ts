import type { Request, Response, NextFunction } from "express";
import { decodeUserToken } from "../utils/token";
import type { JWTPayload } from "../utils/token";
import { ApiError } from "../utils/ApiError";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.accessToken;

  if (!token) {
    return next();
  }

  let decoded: JWTPayload;

  try {
    decoded = decodeUserToken(token);
  } catch {
    return next(new ApiError(401, "Invalid access token"));
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
    return next(new ApiError(401, "You are not logged in"));
  }

  next();
}
