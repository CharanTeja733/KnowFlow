import type { CreateDocument, Document } from "./document.schema";

import { uploadToS3 } from "@repo/storage/upload";

import { documentQueue } from "@repo/queue/document.queue";

import { defaultJobOptions } from "@repo/queue/base";

import { documentRepository } from "@repo/db/repositories";

export async function uploadDocument(document: Document, userId: string) {
  const createdDocument = await documentRepository.create({
    ...document,
    userId,
    status: "PENDING",
  });

  return {
    documentId: createdDocument.id,
    name: createdDocument.name,
  };
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

export async function createDocument({
  userId,
  fileBuffer,
  fileName,
  mimeType,
  size,
}: CreateDocument) {
  /**
   * Upload File
   */

  const fileUrl = await uploadToS3({
    buffer: fileBuffer,
    fileName,
    mimeType,
  });

  /**
   * Persist Document
   */

  const document = await documentRepository.create({
    userId,
    name: fileName,
    fileUrl,
    fileSize: size,
    fileType: mimeType,
    status: "PENDING",
  });

  if (!document) {
    throw new Error("Failed to create document");
  }

  /**
   * Queue Processing Job
   */

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
