import { redisClient } from "@repo/redis/client";
import { Queue } from "bullmq";
import { QUEUE_NAMES } from "./constants";
import type { ProcessDocumentJob } from "./types";

export const documentQueue = new Queue<ProcessDocumentJob>(
  QUEUE_NAMES.DOCUMENT,
  {
    connection: redisClient,
  },
);
