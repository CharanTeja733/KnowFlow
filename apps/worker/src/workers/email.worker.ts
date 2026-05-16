import { Worker } from "bullmq";
import { redisClient } from "@repo/redis/client";
import { sendEmail } from "../services/email/sendEmail";

import { QUEUE_NAMES, JOB_NAMES } from "@repo/queue/constants";
import { registerDeadLetterHandler } from "@repo/queue/utils/registerDeadLetterHandler";

import type { SendEmailJob } from "@repo/queue/types";
import { queueConfig } from "@repo/config";

export const emailWorker = new Worker<SendEmailJob>(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    const { to, subject, html } = job.data;

    await sendEmail(to, subject, html);
  },
  {
    connection: redisClient,
    concurrency: queueConfig.workerConcurrency, // process 5 jobs in parallel
  },
);

registerDeadLetterHandler(emailWorker, JOB_NAMES.FAILED_EMAIL);
