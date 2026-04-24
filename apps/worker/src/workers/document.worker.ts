import { Worker } from "bullmq";
import { redisClient } from "@repo/redis/client";
import { processDocument } from "../services/processDocument";
import type { ProcessDocumentJob } from "@repo/queue/document.queue";

export const documentWorker = new Worker<ProcessDocumentJob>(
  "document-processing",
  async (job) => {
    const { documentId, userId } = job.data;

    await processDocument(documentId, userId);
  },
  {
    connection: redisClient,
    concurrency: 5, // process 5 jobs in parallel
  }
);