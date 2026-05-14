import { env } from "@repo/env";

export const authConfig = {
  emailVerification: {
    expiresMs:
      env.EMAIL_VERIFICATION_EXPIRES_MS,
  },
};