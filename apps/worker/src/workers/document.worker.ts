import { Worker } from "bullmq";
import { redisClient } from "@repo/redis/client";
import { processDocument } from "../services/document/processDocument";
import type { ProcessDocumentJob } from "@repo/queue/types";
import {queueConfig} from "@repo/config";

export const documentWorker = new Worker<ProcessDocumentJob>(
  "document-processing",
  async (job) => {
    const { documentId, userId } = job.data;

    await processDocument(documentId, userId);
  },
  {
    connection: redisClient,
    concurrency: queueConfig.workerConcurrency, // process 5 jobs in parallel
  }
);