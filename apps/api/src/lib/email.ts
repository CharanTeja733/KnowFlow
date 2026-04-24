
export async function sendEmail(to: string, subject: string, html: string) {
    
}

export function verifyEmailTemplate(link: string) {
    return "link";
}


export function resetPasswordTemplate(link: string) {
    return "link";
}

export function forgotPasswordTemplate(resetURL: string) {
    return `
        <p>You requested a password reset</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link expires in 10 minutes</p>
      `
}