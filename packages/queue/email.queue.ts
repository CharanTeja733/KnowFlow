import {redisClient} from "@repo/redis/client";
import {  Queue } from "bullmq";
import type {SendEmailJob} from "./types";
import { QUEUE_NAMES } from "./constants";

export const emailQueue = new Queue<SendEmailJob>(
  QUEUE_NAMES.EMAIL,
  {
    connection: redisClient,
  }
);