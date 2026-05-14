import { env } from "@repo/env";

export const uploadConfig = {
  maxFileSize: env.MAX_FILE_SIZE,

  allowedMimeTypes: [
    "application/pdf",
    "text/plain",
  ],
};