import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as services from "./document.services";

export async function createDocumentController(req: Request, res: Response) {
  const userId = req.user!.id;

  const document = await services.createDocument({
    userId,

    ...req.body,
  });

  res.status(201).json({
    success: true,
    data: document,
  });
}

export async function getDocumentsController(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const documents = await services.getDocuments(userId);
  return res
    .status(201)
    .json({ message: "file uploaded successfully", documents });
}

export async function getDocumentController(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const documentId = req.params.id as string;
  const documentDetails = await services.getDocument(documentId, userId);
  return res
    .status(201)
    .json({ message: "file uploaded successfully", documentDetails });
}

export async function deleteDocumentController(req: Request, res: Response) {
  const documentId = req.params.id as string;
  const userId = req.user?.id as string;
  try {
    await services.deleteDocument(documentId, userId);
  } catch {
    throw new ApiError(404, "Document not found");
  }

  return res.status(201).json({});
}

export async function generatePresignedUrlController(
  req: Request,
  res: Response,
) {
  const userId = req.user!.id;
  const result = await services.generatePresignedUrl(userId, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
}
