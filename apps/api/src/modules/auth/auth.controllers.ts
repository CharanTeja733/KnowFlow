import type { Request, Response } from "express";

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
import { setAuthCookies, clearAuthCookies } from "@/lib/auth-cookies";

// Register
export async function registerController(req: Request, res: Response) {
  const requestId = req.requestId;

  const { name, email, password } = req.body;

  await registerUser({
    name,
    email,
    password,
    requestId,
  });

  return res.status(201).json({
    success: true,
    message: "Verification email sent",
  });
}

// Verify email
export async function verificationController(req: Request, res: Response) {
  const token = req.query.token as string;

  const result = await verifyEmailService(token);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
}

// Login
export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  // Store refresh token in cookie
  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(200).json({
    success: true,
    user: result.user,
  });
}

// Refresh access token
export async function refreshTokenController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const tokens = await refreshAccessToken(refreshToken);

  // Rotate refresh token cookie
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return res.status(200).json({
    success: true,
  });
}

// Logout
export async function logoutController(req: Request, res: Response) {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  await logoutUser(userId);

  // Clear refresh and access token cookies
  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

// Forgot password
export async function forgotPasswordController(req: Request, res: Response) {
  const { email } = req.body;
  const requestId = req.requestId;

  await forgotPassword({ email, requestId });

  return res.status(200).json({
    success: true,
    message: "If the email exists, a reset link has been sent",
  });
}

// Reset password
export async function resetPasswordController(req: Request, res: Response) {
  const { token, password } = req.body;

  await resetPassword(token, password);

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
}
