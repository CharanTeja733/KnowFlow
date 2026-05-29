import type { Response, CookieOptions } from "express";
import { env } from "@repo/env";

const isProduction = env.NODE_ENV === "production";

/**
 * Shared cookie settings
 */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: "lax",

  domain: isProduction ? env.COOKIE_DOMAIN : undefined,
};

/**
 * Access token cookie
 */
const accessTokenOptions: CookieOptions = {
  ...baseCookieOptions,

  maxAge: env.ACCESS_COOKIE_MAX_AGE,

  path: "/",
};

/**
 * Refresh token cookie
 */
const refreshTokenOptions: CookieOptions = {
  ...baseCookieOptions,

  maxAge: env.REFRESH_COOKIE_MAX_AGE,

  path: "/api/auth/refresh-token",
};

/**
 * Set auth cookies
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("accessToken", accessToken, accessTokenOptions);

  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", {
    ...baseCookieOptions,

    path: "/",
  });

  res.clearCookie("refreshToken", {
    ...baseCookieOptions,

    path: "/api/auth/refresh-token",
  });
}
