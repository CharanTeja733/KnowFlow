/* eslint-disable
@typescript-eslint/no-namespace */

import type { JWTPayload } from "../utils/token";
import type { Logger } from "pino";
// import type {Multer} from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      file?: Multer.File;
      requestId: string;
      log: Logger;
    }
  }
}
