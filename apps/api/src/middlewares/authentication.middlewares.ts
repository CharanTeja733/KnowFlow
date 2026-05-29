import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/lib/jwt";
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

  try {
    req.user = verifyAccessToken(token);

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
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
