import type { Request, Response } from "express";

import { streamDocumentEvents } from "./realtime.services";

export async function streamDocumentEventsController(
  req: Request,
  res: Response,
) {
  const documentId = req.params.documentId as string;

  await streamDocumentEvents({
    req,
    res,
    documentId,
  });
}
