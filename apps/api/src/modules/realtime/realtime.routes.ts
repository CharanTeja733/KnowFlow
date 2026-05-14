import { Router } from "express";

import { streamDocumentEventsController } from "./realtime.controllers";

import { ensureAuthenticated } from "../../middlewares/authentication.middlewares";

const router = Router();

router.get(
  "/documents/:documentId/events",
  ensureAuthenticated,
  streamDocumentEventsController,
);

export default router;
