import {redisClient} from "@repo/redis/client";
import {  Queue } from "bullmq";

// 🔥 Define job data type
export type ProcessDocumentJob = {
  documentId: string;
  userId: string;
};

// 🔥 Create queue
export const documentQueue = new Queue<ProcessDocumentJob>(
  "document-processing",
  {
    connection: redisClient,
  }
);