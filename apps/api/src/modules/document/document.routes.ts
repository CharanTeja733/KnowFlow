import express from "express";
import * as controllers from "./document.controllers";
import * as chatControllers from "./chatStream.controller";
import { ensureAuthenticated } from "../../middlewares/authentication.middlewares";
import { uploadLimiter } from "../../middlewares/ratelimiter";
import { validate } from "../../middlewares/validation.middleware";
import {
  deleteDocumentSchema,
  getDocumentSchema,
  generatePresignedUrlSchema,
  createDocumentSchema,
  chatWithDocumentSchema,
} from "./document.schema";

// import { upload } from "@repo/upload/multer";

const router = express.Router();

router.use(ensureAuthenticated);

router.post(
  "/presigned-url",
  uploadLimiter,
  validate(generatePresignedUrlSchema),
  controllers.generatePresignedUrlController,
);
router.post(
  "/finalize",
  uploadLimiter,
  validate(createDocumentSchema),
  controllers.createDocumentController,
);

router.get("/", controllers.getDocumentsController);
router.get(
  "/:documentId",
  validate(getDocumentSchema),
  controllers.getDocumentController,
);
router.delete(
  "/:documentId",
  validate(deleteDocumentSchema),
  controllers.deleteDocumentController,
);

//direct full answer route
router.post(
  "/:id/chat",
  validate(chatWithDocumentSchema),
  controllers.chatDocumentController,
);

//chat stream route
router.get("/:id/chat/stream", chatControllers.chatStream);

//get conversation history route
router.get("/:id/conversations");
export default router;

// router.post("/", upload.single("file"), controllers.uploadDocumentController);
