import { env } from "@repo/env";

export const queueConfig = {
  workerConcurrency:
    env.WORKER_CONCURRENCY,
};