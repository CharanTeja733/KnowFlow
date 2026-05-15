import type {
  GeneratePresignedUrlInput,
  CreateDocumentInput,
} from "./document.schema";

import { documentQueue } from "@repo/queue/document.queue";

import { defaultJobOptions } from "@repo/queue/base";

import { documentRepository } from "@repo/db/repositories";

import { generateUploadUrl } from "@repo/storage/presigned";

type CreateDocumentParams = CreateDocumentInput & {
  userId: string;
};

export async function createDocument({
  userId,
  name,
  storageKey,
  fileSize,
  fileType,
}: CreateDocumentParams) {
  // Create DB record
  const document = await documentRepository.create({
    userId,
    name,
    storageKey,
    fileSize,
    fileType,
  });

  // Queue processing job
  await documentQueue.add(
    "process-document",
    {
      documentId: document.id,

      userId,
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

export async function generatePresignedUrl(data: GeneratePresignedUrlInput) {
  const result = await generateUploadUrl({
    fileName: data.fileName,

    mimeType: data.mimeType,
  });

  return result;
}
