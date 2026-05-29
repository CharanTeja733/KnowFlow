import type {
  GeneratePresignedUrlInput,
  CreateDocumentInput,
} from "./document.schema";

import { documentQueue } from "@repo/queue";

import { defaultJobOptions } from "@repo/queue";

import { documentRepository } from "@repo/db/repositories";

import { generateUploadUrl, verifyUploadedObject } from "@repo/storage";

import { storageConfig } from "@repo/config";

import { ApiError } from "../../lib/errors";

type CreateDocumentParams = CreateDocumentInput & {
  userId: string;
  requestId: string;
};

export async function createDocument({
  userId,
  name,
  storageKey,
  fileSize,
  fileType,
  requestId,
}: CreateDocumentParams) {
  // Verify key belongs to user
  if (!storageKey.startsWith(`documents/${userId}/`)) {
    throw new ApiError(403, "Invalid storage key");
  }

  // Verify object exists in S3
  const uploadedFile = await verifyUploadedObject(storageKey);

  if (!uploadedFile.exists) {
    throw new ApiError(400, "Uploaded file not found");
  }

  // Verify size
  if (uploadedFile.fileSize !== fileSize) {
    throw new ApiError(400, "Invalid file size");
  }

  // Verify mime type
  if (uploadedFile.contentType !== fileType) {
    throw new ApiError(400, "Invalid file type");
  }

  // Additional backend validation
  if (!storageConfig.allowedMimeTypes.includes(fileType)) {
    throw new ApiError(400, "Unsupported file type");
  }

  // Create document
  const document = await documentRepository.create({
    userId,
    name,
    storageKey,
    fileSize,
    fileType,
  });

  // Queue worker job
  await documentQueue.add(
    "process-document",
    {
      documentId: document.id,
      userId,
      requestId,
    },
    defaultJobOptions,
  );

  return document;
}

export async function getDocuments(userId: string) {
  return documentRepository.findManyByUserId(userId);
}

export async function getDocument(documentId: string, userId: string) {
  return documentRepository.findById(documentId, userId);
}

export async function deleteDocument(documentId: string, userId: string) {
  const result = await documentRepository.delete(documentId, userId);

  if (result.rowCount === 0) {
    throw new Error("Document not found");
  }
}

export async function generatePresignedUrl(
  userId: string,
  data: GeneratePresignedUrlInput,
) {
  return generateUploadUrl({
    userId,

    fileName: data.fileName,
    mimeType: data.mimeType,
  });
}
