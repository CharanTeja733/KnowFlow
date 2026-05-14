import { Resend } from "resend";
import { env } from "@repo/env";

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  const emailFromAddress = env.EMAIL_FROM_ADDRESS;
  await resend.emails.send({
    from: emailFromAddress,
    to,
    subject,
    html,
  });
}
