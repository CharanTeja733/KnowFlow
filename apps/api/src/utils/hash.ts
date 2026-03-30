import bcrypt from 'bcrypt';

export async function generateHashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}