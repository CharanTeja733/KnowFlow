import type {
  Request,
  Response,
} from "express";

import {
  subscribe,
  unsubscribe,
} from "@repo/redis/pubsub";

import {
  documentChannel,
} from "@repo/events";

import db from "@repo/db";

import {
  documentTable,
} from "@repo/db/schema";

import { and, eq } from "drizzle-orm";

import { ApiError }
from "../../utils/ApiError";

const HEARTBEAT_INTERVAL = 30000;

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
    throw new ApiError(
        401,
        "Unauthorized"
    );
    }

    const userId = req.user.id;

  /**
   * -----------------------------------
   * Authorization Check
   * -----------------------------------
   */

  const document =
    await db
        .select()
        .from(documentTable)
        .where(and(eq(documentTable.userId, userId), eq(documentTable.id, documentId)));


  if (!document) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }

  /**
   * -----------------------------------
   * SSE Setup
   * -----------------------------------
   */

  setupSSEHeaders(res);

  sendEvent(res, {
    type: "CONNECTED",
    documentId,
  });

  const channel =
    documentChannel(documentId);

  /**
   * -----------------------------------
   * Redis Event Handler
   * -----------------------------------
   */

  const eventHandler = (
    data: unknown
  ) => {
    sendEvent(res, data);
  };

  /**
   * -----------------------------------
   * Subscribe To Redis Channel
   * -----------------------------------
   */

  await subscribe(
    channel,
    eventHandler
  );

  /**
   * -----------------------------------
   * Heartbeat
   * Prevents proxies/load balancers
   * from killing idle SSE connections
   * -----------------------------------
   */

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, HEARTBEAT_INTERVAL);

  /**
   * -----------------------------------
   * Cleanup On Disconnect
   * CRITICAL
   * -----------------------------------
   */

  req.on("close", async () => {
    clearInterval(heartbeat);

    await unsubscribe(
      channel,
      eventHandler
    );

    res.end();
  });
}

/**
 * -----------------------------------
 * SSE Headers
 * -----------------------------------
 */

function setupSSEHeaders(
  res: Response
) {
  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  /**
   * Disables nginx buffering
   */

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  res.flushHeaders();
}

/**
 * -----------------------------------
 * Send SSE Event
 * -----------------------------------
 */

function sendEvent(
  res: Response,
  data: unknown
) {
  res.write(
    `data: ${JSON.stringify(data)}\n\n`
  );
}