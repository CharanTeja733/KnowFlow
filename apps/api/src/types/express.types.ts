import type { JWTPayload } from "../utils/token";

declare global{
    namespace Express {
        interface Request {
            user?: JWTPayload;
            file?: Multer.File;
        }
    }
}