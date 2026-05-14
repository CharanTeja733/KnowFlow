import jwt from "jsonwebtoken";
import { ApiError } from "@/lib/errors";

export function generateAccessToken(userId: string, role: string) {
  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRY ||
    "15m") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ userId, role }, process.env.ACCESS_SECRET!, { expiresIn });
}

export function generateRefreshToken(userId: string) {
  const expiresIn = (process.env.REFRESH_TOKEN_EXPIRY ||
    "7d") as jwt.SignOptions["expiresIn"];
  const token = jwt.sign({ userId }, process.env.REFRESH_SECRET!, {
    expiresIn,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export function verifyRefreshToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET!) as { userId: string };
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}
