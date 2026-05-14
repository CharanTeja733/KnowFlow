import { documentChannel } from "./channels";
import { publishEvent } from "./publisher";

import { DocumentEventType } from "./types";

export async function publishDocumentProcessing(documentId: string) {
  await publishEvent(documentChannel(documentId), {
    type: DocumentEventType.STATUS,
    status: "PROCESSING",
  });
}

export async function publishDocumentProgress(
  documentId: string,
  completedChunks: number,
  totalChunks: number,
) {
  const progressPercentage = Math.floor((completedChunks / totalChunks) * 100);

  await publishEvent(documentChannel(documentId), {
    type: DocumentEventType.PROGRESS,
    completedChunks,
    totalChunks,
    progressPercentage,
  });
}

export async function publishDocumentCompleted(
  documentId: string,
  summary: string,
) {
  await publishEvent(documentChannel(documentId), {
    type: DocumentEventType.COMPLETED,
    summary,
  });
}

export async function publishDocumentFailed(documentId: string, error: string) {
  await publishEvent(documentChannel(documentId), {
    type: DocumentEventType.FAILED,
    error,
  });
}
