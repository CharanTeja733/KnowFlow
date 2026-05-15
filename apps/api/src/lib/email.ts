export function verifyEmailTemplate(verificationURL: string) {
  return `
        <p>Verfication Email</p>
        <a href="${verificationURL}">Verify Email</a>
        <p>This link expires in 24 hours</p>
      `;
}

export function forgotPasswordTemplate(resetURL: string) {
  return `
        <p>You requested a password reset</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link expires in 10 minutes</p>
      `;
}
