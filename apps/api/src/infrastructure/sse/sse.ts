import type {
  Response,
} from "express";

export function setupSSEHeaders(
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
   * Disable nginx buffering
   */

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  res.flushHeaders();
}

export function sendSSEEvent(
  res: Response,
  data: unknown
) {
  res.write(
    `data: ${JSON.stringify(data)}\n\n`
  );
}

export function sendSSEComment(
  res: Response,
  comment: string
) {
  res.write(
    `: ${comment}\n\n`
  );
}