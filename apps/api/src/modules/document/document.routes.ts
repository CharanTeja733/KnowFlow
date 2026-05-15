import express from "express";
import * as controllers from "./document.controllers";
import { ensureAuthenticated } from "../../middlewares/authentication.middlewares";
import { validate } from "../../middlewares/validation.middleware";
import {
  deleteDocumentSchema,
  getDocumentSchema,
  generatePresignedUrlSchema,
  createDocumentSchema,
} from "./document.schema";
// import { upload } from "@repo/upload/multer";

const router = express.Router();

router.use(ensureAuthenticated);
router.post(
  "/",
  validate(createDocumentSchema),
  controllers.createDocumentController,
);

router.get("/", controllers.getDocumentsController);
router.get(
  "/:id",
  validate(getDocumentSchema),
  controllers.getDocumentController,
);
router.delete(
  "/:id",
  validate(deleteDocumentSchema),
  controllers.deleteDocumentController,
);
router.post(
  "/presigned-url",
  validate(generatePresignedUrlSchema),
  controllers.generatePresignedUrlController,
);

export default router;

// router.post("/", upload.single("file"), controllers.uploadDocumentController);
