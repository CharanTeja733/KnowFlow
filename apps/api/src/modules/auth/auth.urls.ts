import { urlConfig } from "@repo/config";

export function buildResetPasswordUrl(token: string) {
  return `${urlConfig.frontendUrl}/reset-password?token=${token}`;
}

export function buildEmailVerificationUrl(token: string) {
  return `${urlConfig.frontendUrl}/verify-email?token=${token}`;
}
