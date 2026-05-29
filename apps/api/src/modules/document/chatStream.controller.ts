import type { Request, Response } from "express";

import { documentRepository } from "@repo/db/repositories";

import { subscribe, unsubscribe } from "@repo/redis";

import {
  setupSSEHeaders,
  sendSSEEvent,
  sendSSEComment,
} from "../../infrastructure/sse/sse";

import { ApiError } from "@/lib/errors";

type ChatStreamParams = {
  id: string;
};

export async function chatStream(
  req: Request<ChatStreamParams>,

  res: Response,
) {
  const { id: documentId } = req.params;

  const userId = req.user?.userId;

   if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

  /**
   * -----------------------------------
   * Verify ownership
   * -----------------------------------
   */

  const document = await documentRepository.findById(documentId, userId);

  if (!document) {
    return res.status(404).json({
      message: "Document not found",
    });
  }

  req.log.info(
    {
      documentId,
      userId,
    },
    "Chat stream connected",
  );

  /**
   * -----------------------------------
   * Setup SSE
   * -----------------------------------
   */

  setupSSEHeaders(res);

  /**
   * -----------------------------------
   * Initial connection
   * -----------------------------------
   */

  sendSSEEvent(res, {
    type: "connected",

    connected: true,
  });

  /**
   * -----------------------------------
   * Heartbeat
   * -----------------------------------
   */

  const heartbeat = setInterval(() => {
    sendSSEComment(res, "heartbeat");
  }, 30000);

  /**
   * -----------------------------------
   * Subscribe to Redis
   * -----------------------------------
   */

  const channel = `chat:${documentId}`;

  const callback = (message: unknown) => {
    try {
      sendSSEEvent(res, message);
    } catch (err) {
      req.log.error({ err }, "Failed to send SSE event");
    }
  };

  await subscribe(channel, callback);

  req.on(
    "close",

    async () => {
      clearInterval(heartbeat);

      await unsubscribe(channel, callback);

      req.log.info(
        {
          documentId,
          userId,
        },
        "Chat stream disconnected",
      );
    },
  );
}
