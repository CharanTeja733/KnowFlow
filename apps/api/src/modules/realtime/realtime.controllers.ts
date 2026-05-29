import type { Request, Response } from "express";

import { streamDocumentEvents } from "./realtime.services";

export async function streamDocumentEventsController(
  req: Request<{documentId: string}>,
  res: Response,
) {
  const { documentId } = req.params;

  await streamDocumentEvents({
    req,
    res,
    documentId,
  });
}
