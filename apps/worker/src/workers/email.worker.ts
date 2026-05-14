import { Worker } from "bullmq";
import { redisClient } from "@repo/redis/client";
import { sendEmail } from "../services/email/sendEmail";

import { deadLetterQueue } from "@repo/queue/dead-letter.queue";
import  { QUEUE_NAMES,JOB_NAMES} from "@repo/queue/constants";

import type { SendEmailJob, DeadLetterJob } from "@repo/queue/types";
import {queueConfig} from "@repo/config";


export const emailWorker = new Worker<SendEmailJob>(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    const {to, subject, html } = job.data;

    await sendEmail(to, subject, html);
  },
  {
    connection: redisClient,
    concurrency: queueConfig.workerConcurrency, // process 5 jobs in parallel
  }
);


emailWorker.on("failed", async (job, err) => {
  if (!job) return;

  // only move to DLQ after ALL retries are done
  if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
    const dlqPayload: DeadLetterJob = {
      originalJobName: job.name,
      originalQueue: job.queueName,
      payload: job.data,

      errorMessage: err.message,
      failedAt: new Date().toISOString(),

      attemptsMade: job.attemptsMade,
    };

    await deadLetterQueue.add(JOB_NAMES.FAILED_EMAIL, dlqPayload);

    console.error("Moved to DLQ:", dlqPayload);
  }
});