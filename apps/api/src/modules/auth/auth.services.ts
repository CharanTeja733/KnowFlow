import db from "@repo/db";
import { userTable } from "@repo/db/schema";
import { emailQueue } from "@repo/queue/email.queue";
import { eq } from 'drizzle-orm';

import type { Register, Signup } from './auth.schema';
import { hashToken, generateToken, hashPassword, comparePassword, generateResetToken } from '@/lib/security';
import { forgotPasswordTemplate, verifyEmailTemplate } from '../../lib/email';
import { ApiError } from '@/lib/errors';
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from '@/lib/jwt';
import { defaultJobOptions } from "@repo/queue/base";

export async function getUserByEmail(email: string) {
    const [user]  = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

    return user;
}

export async function createUser(user: Signup) {
    const [createdUser] = await db
        .insert(userTable)
        .values({ ...user})
        .returning({
            name: userTable.name, 
            email: userTable.email,
            id: userTable.id
        });
        
    return createdUser;
}

export async function registerUser(userDetails: Register) {
    const {name, email, password} = userDetails;
    
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const hashedPassword = await hashPassword(password);

    const [user] = await db
        .insert(userTable)
        .values({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .returning({
            name: userTable.name,
            email: userTable.email,
            id: userTable.id,
        }); 

    const link = `http://localhost:3000/verify-email?token=${rawToken}`;
    
    if (user) {
      const data = {
          to: user.email,
          subject: "Verify Email",
          html: verifyEmailTemplate(link),
      }
      await emailQueue.add("send-email", data, defaultJobOptions);
    }

    return user;    
}


export async function verifyEmailService(token: string) {
    // 1. hash incoming token
    const hashedToken = hashToken(token);

    // 2. find user by token
    const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.emailVerificationToken, hashedToken))
        .limit(1);

    // 3. validate user
    if (!user) {
        throw new Error("Invalid or expired token");
    }

    // 4. check expiry
    if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
        throw new Error("Token expired");
    }

    // 5. update user
    await db
        .update(userTable)
        .set({
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        })
        .where(eq(userTable.id, user.id));    

    return {
        message: "Email verified successfully",
    };
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    // increment failed attempts (optional)
    throw new ApiError(401, "Invalid credentials");
  }

  // reset failed attempts (optional)
  const accessToken = generateAccessToken(user.id, user.role);

  const { token: refreshToken, expiresAt } = generateRefreshToken(user.id);

  // store hashed token + expiry
  await db
    .update(userTable)
    .set({
      refreshToken: hashToken(refreshToken),
      refreshTokenExpires: expiresAt,
    })
    .where(eq(userTable.id, user.id));

  return {
    accessToken,
    refreshToken, // send raw token to client
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}


export async function refreshAccessToken(oldRefreshToken: string) {
  if (!oldRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  // ✅ delegate JWT logic
  const payload = verifyRefreshToken(oldRefreshToken);

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, payload.userId))
    .limit(1);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.refreshToken) {
    throw new ApiError(401, "No active session");
  }

  if (
    !user.refreshTokenExpires ||
    user.refreshTokenExpires < new Date()
  ) {
    throw new ApiError(401, "Refresh token expired");
  }

  // ✅ delegate hashing
  const hashedIncoming = hashToken(oldRefreshToken);

  if (hashedIncoming !== user.refreshToken) {
    // 🚨 reuse detection
    await db
      .update(userTable)
      .set({
        refreshToken: null,
        refreshTokenExpires: null,
      })
      .where(eq(userTable.id, user.id));

    throw new ApiError(401, "Invalid refresh token");
  }

  // 🔁 rotation
  const { token: newRefreshToken, expiresAt } =
    generateRefreshToken(user.id);

  const newAccessToken = generateAccessToken(
    user.id,
    user.role
  );

  await db
    .update(userTable)
    .set({
      refreshToken: hashToken(newRefreshToken),
      refreshTokenExpires: expiresAt,
    })
    .where(eq(userTable.id, user.id));

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(userId: string) {
  await db
    .update(userTable)
    .set({
      refreshToken: null,
      refreshTokenExpires: null
    })
    .where(eq(userTable.id, userId));
}


export async function forgotPassword(email: string) {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (!user) {
      return;
    }
    
    const {rawToken, hashedToken, expiresAt} = generateResetToken();

    await db
      .update(userTable)
      .set({
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt
      })
      .where(eq(userTable.id, user.id))
      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

      const data = {
        to: user.email,
        subject: "Reset Password",
        html: forgotPasswordTemplate(resetURL),
      };

    await emailQueue.add("send-email", data, defaultJobOptions);
}


export async function resetPassword(
  token: string,
  newPassword: string
) {
  // 🔐 hash incoming token
  const hashedToken = hashToken(token);

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.passwordResetToken, hashedToken))
    .limit(1);

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // 🔐 check expiry
  if (
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw new ApiError(400, "Token expired");
  }

  // 🔒 hash new password
  const hashedPassword = await hashPassword(newPassword);

  // 🧹 update user + cleanup
  await db
    .update(userTable)
    .set({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,

      // 🔐 optional but recommended
      refreshToken: null,
      refreshTokenExpires: null,
    })
    .where(eq(userTable.id, user.id));
}