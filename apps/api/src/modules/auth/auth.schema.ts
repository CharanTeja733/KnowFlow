import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().max(255),
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
});
export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().max(255),
    email: z.email().trim().max(255),
    password: z.string().trim().min(8).max(72),
  }),
});

export const emailVerificationSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().trim().min(8).max(72),
  }),
});

export type Register = z.infer<typeof registerSchema>["body"] & {
  requestId: string;
};

export type ForgotPasswordSchema = z.infer<
  typeof forgotPasswordSchema
>["body"] & { requestId: string };

export type Login = z.infer<typeof loginSchema>["body"];

export type Signup = z.infer<typeof signupSchema>["body"];
export type Signin = z.infer<typeof signinSchema>["body"];
