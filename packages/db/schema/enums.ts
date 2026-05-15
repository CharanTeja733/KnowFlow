import { pgEnum } from "drizzle-orm/pg-core";

export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADING",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
