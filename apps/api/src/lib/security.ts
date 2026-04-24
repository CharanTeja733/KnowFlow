import crypto from "crypto";
import bcrypt from "bcrypt";

export function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
    return crypto.createHash('Sha256').update(token).digest('hex');
}

export function generateResetToken() {
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10mins
    return {rawToken, hashedToken, expiresAt};
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
   return await bcrypt.compare(password, hashedPassword)
}     

