import type { Request, Response } from "express";

import { subscribe, unsubscribe } from "@repo/redis/pubsub";

import { documentChannel } from "@repo/events";

import { documentRepository } from "@repo/db/repositories";

import {
  setupSSEHeaders,
  sendSSEEvent,
  sendSSEComment,
} from "../../infrastructure/sse/sse";

import { realtimeConfig } from "@repo/config";

import { ApiError } from "../../utils/ApiError";

const HEARTBEAT_INTERVAL = realtimeConfig.heartbeatInterval;

type StreamDocumentEventsParams = {
  req: Request;
  res: Response;
  documentId: string;
};

export async function streamDocumentEvents({
  req,
  res,
  documentId,
}: StreamDocumentEventsParams) {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const userId = req.user.id;

  /**
   * -----------------------------------
   * Authorization Check
   * -----------------------------------
   */

  const document = await documentRepository.findById(documentId, userId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  /**
   * -----------------------------------
   * SSE Setup
   * -----------------------------------
   */

  setupSSEHeaders(res);

  sendSSEEvent(res, {
    type: "CONNECTED",
    documentId,
  });

  const channel = documentChannel(documentId);

  /**
   * -----------------------------------
   * Redis Event Handler
   * -----------------------------------
   */

  const eventHandler = (data: unknown) => {
    sendSSEEvent(res, data);
  };

  /**
   * -----------------------------------
   * Subscribe To Redis Channel
   * -----------------------------------
   */

  await subscribe(channel, eventHandler);

  /**
   * -----------------------------------
   * Heartbeat
   * Prevents proxies/load balancers
   * from killing idle SSE connections
   * -----------------------------------
   */

  const heartbeat = setInterval(() => {
    sendSSEComment(res, "heartbeat");
  }, HEARTBEAT_INTERVAL);
  /**
   * -----------------------------------
   * Cleanup On Disconnect
   * CRITICAL
   * -----------------------------------
   */

  res.on("close", async () => {
    try {
      clearInterval(heartbeat);

      await unsubscribe(channel, eventHandler);

      res.end();
    } catch (error) {
      console.error("SSE cleanup failed", error);
    }
  });
}
