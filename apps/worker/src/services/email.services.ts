import { Resend } from "resend";
export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
    const emailFromAddress = process.env.EMAIL_FROM_ADDRESS!;
    await resend.emails.send({
      from: emailFromAddress,
      to,
      subject,
      html,
    });
}