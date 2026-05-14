import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError";
import * as services from "./document.services";

export async function uploadDocumentController(req: Request, res: Response) {
  const userId = req.user!.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const documentDetails = await services.createDocument({
    userId,
    fileBuffer: req.file.buffer,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  return res.status(201).json({
    message: "File uploaded successfully",
    documentDetails,
  });
}

export async function getDocumentsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id as string;
  const documents = await services.getDocuments(userId);
  return res
    .status(201)
    .json({ message: "file uploaded successfully", documents });
}

export async function getDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id as string;
  const documentId = req.params.id as string;
  const documentDetails = await services.getDocument(documentId, userId);
  return res
    .status(201)
    .json({ message: "file uploaded successfully", documentDetails });
}

export async function deleteDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const documentId = req.params.id as string;
  const userId = req.user?.id as string;
  try {
    const documentDetails = await services.deleteDocument(documentId, userId);
  } catch (err) {
    throw new ApiError(404, "Document not found");
  }

  return res.status(201).json({});
}
