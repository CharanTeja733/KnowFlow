import {
  documentRepository,
  processingRepository,
} from "@repo/db/repositories";

import { downloadFile } from "@repo/storage/download";

import { parseFile } from "@repo/parser/parse";

import { summarizeDocument } from "./summarizeDocument";

import {
  publishDocumentProcessing,
  publishDocumentProgress,
  publishDocumentCompleted,
  publishDocumentFailed,
} from "@repo/events";

export async function processDocument(documentId: string, userId: string) {
  /**
   * -----------------------------------
   * Fetch Document
   * -----------------------------------
   */

  const document = await documentRepository.findById(documentId, userId);

  if (!document) {
    throw new Error("Document not found");
  }

  /**
   * -----------------------------------
   * Idempotency
   * -----------------------------------
   */

  if (document.status === "COMPLETED") {
    console.log("Already processed:", documentId);

    return;
  }

  try {
    /**
     * -----------------------------------
     * Update Status
     * -----------------------------------
     */

    await documentRepository.markProcessing(documentId);

    /**
     * -----------------------------------
     * Publish Processing Event
     * -----------------------------------
     */

    await publishDocumentProcessing(documentId);

    /**
     * -----------------------------------
     * Fetch File
     * -----------------------------------
     */

    const buffer = await downloadFile(document.storageKey);

    /**
     * -----------------------------------
     * Parse File
     * -----------------------------------
     */

    const text = await parseFile(buffer, document.fileType);

    if (!text || text.trim().length === 0) {
      throw new Error("No readable content found");
    }

    /**
     * -----------------------------------
     * Summarize Document
     * -----------------------------------
     */

    let processingInitialized = false;

    const result = await summarizeDocument(text, {
      onProgress: async (completedChunks, totalChunks) => {
        /**
         * Initialize Processing State
         */

        if (!processingInitialized) {
          await processingRepository.start(documentId, totalChunks);

          processingInitialized = true;
        }

        /**
         * Persist Progress
         */

        await processingRepository.updateProgress(documentId, completedChunks);

        /**
         * Publish Progress Event
         */

        await publishDocumentProgress(documentId, completedChunks, totalChunks);
      },
    });

    /**
     * -----------------------------------
     * Persist Summary
     * -----------------------------------
     */

    await documentRepository.markCompleted(documentId, result.summary);

    /**
     * -----------------------------------
     * Cleanup Processing State
     * -----------------------------------
     */

    await processingRepository.clear(documentId);

    /**
     * -----------------------------------
     * Publish Completion Event
     * -----------------------------------
     */

    await publishDocumentCompleted(documentId, result.summary);

    console.log("✅ Document processed:", documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    /**
     * -----------------------------------
     * Persist Failure
     * -----------------------------------
     */

    await documentRepository.markFailed(documentId, message);

    /**
     * -----------------------------------
     * Cleanup Processing State
     * -----------------------------------
     */

    await processingRepository.clear(documentId);

    /**
     * -----------------------------------
     * Publish Failure Event
     * -----------------------------------
     */

    await publishDocumentFailed(documentId, message);

    console.error("❌ Processing failed:", documentId, message);

    throw err;
  }
}
