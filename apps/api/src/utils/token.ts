import jwt  from "jsonwebtoken";

export interface JWTPayload {
    name: string,
    email: string,
    id: string,
}

const JWT_SECRET: string = process.env.JWT_SECRET!;
export function createUserToken(payload: JWTPayload) {
   return jwt.sign(payload, JWT_SECRET);
}

export function decodeUserToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
}