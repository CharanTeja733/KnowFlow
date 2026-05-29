/* eslint-disable
@typescript-eslint/no-namespace */

import type { AccessTokenPayload } from "@/lib/jwt";
import type { Logger } from "pino";
// import type {Multer} from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      file?: Multer.File;
      requestId: string;
      log: Logger;
    }
  }
}
