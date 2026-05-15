// apps/api/src/modules/auth/auth.services.ts

import { userRepository } from "@repo/db/repositories";
import { emailQueue } from "@repo/queue/email.queue";
import { defaultJobOptions } from "@repo/queue/base";

import {
  hashPassword,
  comparePassword,
  generateToken,
  hashToken,
  generateResetToken,
} from "@/lib/security";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";

import { forgotPasswordTemplate, verifyEmailTemplate } from "../../lib/email";

import { authConfig } from "@repo/config";
import { buildResetPasswordUrl, buildEmailVerificationUrl } from "./auth.urls";
import { ApiError } from "@/lib/errors";

import type { Register } from "./auth.schema";

// Register user
export async function registerUser(userDetails: Register) {
  const { name, email, password } = userDetails;

  // Check existing user
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // Generate verification token
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(
      Date.now() + authConfig.emailVerification.expiresMs,
    ),
  });

  // Send verification email
  const verificationLink = buildEmailVerificationUrl(rawToken);
  await emailQueue.add(
    "send-email",
    {
      to: user.email,
      subject: "Verify Email",
      html: verifyEmailTemplate(verificationLink),
    },
    defaultJobOptions,
  );

  return user;
}

// Verify email
export async function verifyEmailService(token: string) {
  const hashedToken = hashToken(token);

  const user = await userRepository.findByEmailVerificationToken(hashedToken);

  if (!user) {
    throw new ApiError(400, "Invalid token");
  }

  if (
    !user.emailVerificationExpires ||
    new Date() > user.emailVerificationExpires
  ) {
    throw new ApiError(400, "Token expired");
  }

  await userRepository.markEmailVerified(user.id);

  return {
    message: "Email verified successfully",
  };
}

// Login user
export async function loginUser(email: string, password: string) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified");
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);

  const { token: refreshToken, expiresAt } = generateRefreshToken(user.id);

  // Store refresh token
  await userRepository.storeRefreshToken(
    user.id,
    hashToken(refreshToken),
    expiresAt,
  );

  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

// Refresh access token
export async function refreshAccessToken(oldRefreshToken: string) {
  if (!oldRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  // Verify refresh token
  const payload = verifyRefreshToken(oldRefreshToken);

  const user = await userRepository.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.refreshToken) {
    throw new ApiError(401, "No active session");
  }

  if (!user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
    throw new ApiError(401, "Refresh token expired");
  }

  // Detect token reuse
  const hashedIncoming = hashToken(oldRefreshToken);

  if (hashedIncoming !== user.refreshToken) {
    await userRepository.clearRefreshToken(user.id);

    throw new ApiError(401, "Invalid refresh token");
  }

  // Rotate tokens
  const { token: newRefreshToken, expiresAt } = generateRefreshToken(user.id);

  const newAccessToken = generateAccessToken(user.id, user.role);

  await userRepository.storeRefreshToken(
    user.id,
    hashToken(newRefreshToken),
    expiresAt,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// Logout user
export async function logoutUser(userId: string) {
  await userRepository.clearRefreshToken(userId);
}

// Forgot password
export async function forgotPassword(email: string) {
  const user = await userRepository.findByEmail(email);

  // Prevent user enumeration
  if (!user) {
    return;
  }

  const { rawToken, hashedToken, expiresAt } = generateResetToken();

  await userRepository.storePasswordResetToken(user.id, hashedToken, expiresAt);

  const resetURL = buildResetPasswordUrl(rawToken);

  await emailQueue.add(
    "send-email",
    {
      to: user.email,
      subject: "Reset Password",
      html: forgotPasswordTemplate(resetURL),
    },
    defaultJobOptions,
  );
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = hashToken(token);

  const user = await userRepository.findByPasswordResetToken(hashedToken);

  if (!user) {
    throw new ApiError(400, "Invalid token");
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(400, "Token expired");
  }

  const hashedPassword = await hashPassword(newPassword);

  await userRepository.updatePassword(user.id, hashedPassword);
}
