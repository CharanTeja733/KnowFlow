
import {pgTable, varchar, uuid, timestamp,boolean, text, pgEnum, integer, vector, date} from "drizzle-orm/pg-core";

export const roles = pgEnum('Role', ['USER', 'ADMIN']);

export const userTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),

    name: varchar('name', {length: 255}).notNull(),
    email: varchar('email', {length: 255}).unique().notNull(),
    password: text('password').notNull(),
    role: roles('role').default('USER').notNull(),

    isEmailVerified: boolean('is_email_verified').default(false),
    emailVerificationToken: text('email_verification_token'),
    emailVerificationExpires: timestamp('email_verification_expires'),

    passwordResetToken: text('password_reset_token'),
    passwordResetExpires: timestamp('password_reset_expires'),

    refreshToken: text('refresh_token'),
    refreshTokenExpires: timestamp("refresh_token_expires"),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date())
});

