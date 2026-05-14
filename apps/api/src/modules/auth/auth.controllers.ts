import type { Request, Response } from "express";
import {env} from "@repo/env";

import {
  registerUser,
  verifyEmailService,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "./auth.services";

import { ApiError } from "@/lib/errors";


// Register
export async function registerController(
  req: Request,
  res: Response
) {
  const { name, email, password } = req.body;

  await registerUser({
    name,
    email,
    password,
  });

  return res.status(201).json({
    success: true,
    message: "Verification email sent",
  });
}


// Verify email
export async function verificationController(
  req: Request,
  res: Response
) {
  const token = req.query.token as string;

  const result =
    await verifyEmailService(token);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
}


// Login
export async function loginController(
  req: Request,
  res: Response
) {
  const { email, password } = req.body;

  const result =
    await loginUser(email, password);

  // Store refresh token in cookie
  res.cookie(
  "refreshToken",
  result.refreshToken,
  {
    httpOnly: true,

    secure:
      env.NODE_ENV ===
      "production",

    sameSite: "strict",

    domain:
      env.NODE_ENV ===
      "production"
        ? env.COOKIE_DOMAIN
        : undefined,

    maxAge:
      env.COOKIE_MAX_AGE,
  }
);

  return res.status(200).json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
  });
}


// Refresh access token
export async function refreshTokenController(
  req: Request,
  res: Response
) {
  const refreshToken =
    req.cookies.refreshToken as string;

  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token missing"
    );
  }

  const tokens =
    await refreshAccessToken(
      refreshToken
    );

  // Rotate refresh token cookie
  res.cookie(
    "refreshToken",
    tokens.refreshToken,
    {
      httpOnly: true,

      secure:
        env.NODE_ENV ===
        "production",

      sameSite: "strict",

      domain:
        env.NODE_ENV ===
        "production"
          ? env.COOKIE_DOMAIN
          : undefined,

      maxAge:
        env.COOKIE_MAX_AGE,
    }
  );

  return res.status(200).json({
    success: true,
    accessToken: tokens.accessToken,
  });
}


// Logout
export async function logoutController(
  req: Request,
  res: Response
) {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(
      401,
      "Unauthorized"
    );
  }

  await logoutUser(userId);

  // Clear refresh token cookie
  res.clearCookie(
    "refreshToken",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "strict",
    }
  );

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}


// Forgot password
export async function forgotPasswordController(
  req: Request,
  res: Response
) {
  const { email } = req.body;

  await forgotPassword(email);

  return res.status(200).json({
    success: true,

    message:
      "If the email exists, a reset link has been sent",
  });
}


// Reset password
export async function resetPasswordController(
  req: Request,
  res: Response
) {
  const { token, password } = req.body;

  await resetPassword(token, password);

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
}