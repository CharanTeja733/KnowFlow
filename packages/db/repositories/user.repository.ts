import db from "../index";

import { userTable } from "../schema";

import { eq } from "drizzle-orm";

export const userRepository = {
  /**
   * -----------------------------------
   * Find By Email
   * -----------------------------------
   */

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    return user;
  },

  /**
   * -----------------------------------
   * Find By Id
   * -----------------------------------
   */

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    return user;
  },

  /**
   * -----------------------------------
   * Create User
   * -----------------------------------
   */

  async create(data: {
    name: string;
    email: string;
    password: string;
    emailVerificationToken?: string | null;
    emailVerificationExpires?: Date | null;
  }) {
    const [user] = await db.insert(userTable).values(data).returning({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      isEmailVerified: userTable.isEmailVerified,
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },

  /**
   * -----------------------------------
   * Find By Email Verification Token
   * -----------------------------------
   */

  async findByEmailVerificationToken(token: string) {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.emailVerificationToken, token))
      .limit(1);

    return user;
  },

  /**
   * -----------------------------------
   * Mark Email Verified
   * -----------------------------------
   */

  async markEmailVerified(userId: string) {
    await db
      .update(userTable)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      })
      .where(eq(userTable.id, userId));
  },

  /**
   * -----------------------------------
   * Store Refresh Token
   * -----------------------------------
   */

  async storeRefreshToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date,
  ) {
    await db
      .update(userTable)
      .set({
        refreshToken: hashedToken,
        refreshTokenExpires: expiresAt,
      })
      .where(eq(userTable.id, userId));
  },

  /**
   * -----------------------------------
   * Clear Refresh Token
   * -----------------------------------
   */

  async clearRefreshToken(userId: string) {
    await db
      .update(userTable)
      .set({
        refreshToken: null,
        refreshTokenExpires: null,
      })
      .where(eq(userTable.id, userId));
  },

  /**
   * -----------------------------------
   * Store Password Reset Token
   * -----------------------------------
   */

  async storePasswordResetToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date,
  ) {
    await db
      .update(userTable)
      .set({
        passwordResetToken: hashedToken,

        passwordResetExpires: expiresAt,
      })
      .where(eq(userTable.id, userId));
  },

  /**
   * -----------------------------------
   * Find By Password Reset Token
   * -----------------------------------
   */

  async findByPasswordResetToken(token: string) {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.passwordResetToken, token))
      .limit(1);

    return user;
  },

  /**
   * -----------------------------------
   * Update Password
   * -----------------------------------
   */

  async updatePassword(userId: string, hashedPassword: string) {
    await db
      .update(userTable)
      .set({
        password: hashedPassword,

        passwordResetToken: null,

        passwordResetExpires: null,

        refreshToken: null,

        refreshTokenExpires: null,
      })
      .where(eq(userTable.id, userId));
  },
};
