import { Queue } from "bullmq";
import { redisClient } from "@repo/redis/client";
import { QUEUE_NAMES } from "./constants";

export const deadLetterQueue = new Queue(QUEUE_NAMES.DEAD_LETTER, {
  connection: redisClient,
});

