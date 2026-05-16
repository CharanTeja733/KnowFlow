import type { Worker } from "bullmq";

import { deadLetterQueue } from "../dead-letter.queue";

import type { DeadLetterJob } from "../types";

export function registerDeadLetterHandler(
  worker: Worker,

  deadLetterJobName: string,
) {
  worker.on(
    "failed",

    async (job, err) => {
      if (!job) {
        return;
      }

      // Only move to DLQ
      // after ALL retries fail
      if (job.attemptsMade < (job.opts.attempts ?? 1)) {
        return;
      }

      try {
        const dlqPayload: DeadLetterJob = {
          originalJobName: job.name,

          originalQueue: job.queueName,

          payload: job.data,

          errorMessage: err.message,

          failedAt: new Date().toISOString(),

          attemptsMade: job.attemptsMade,
        };

        await deadLetterQueue.add(deadLetterJobName, dlqPayload);

        console.error("Moved to DLQ:", dlqPayload);
      } catch (dlqError) {
        console.error("Failed to move job to DLQ:", dlqError);
      }
    },
  );
}
