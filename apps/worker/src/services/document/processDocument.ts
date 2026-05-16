import {
  documentRepository,
  processingRepository,
} from "@repo/db/repositories";

import { downloadFile } from "@repo/storage/download";

import { parseFile } from "@repo/parser/parse";
import { validateFile } from "@repo/parser/validate";
import { parserConfig } from "@repo/config/parser.config";

import { summarizeDocument } from "./summarizeDocument";

import {
  publishDocumentProcessing,
  publishDocumentProgress,
  publishDocumentCompleted,
  publishDocumentFailed,
} from "@repo/events";

type ProcessDocumentParams = {
  documentId: string;
  userId: string;
  requestId: string;
};

export async function processDocument({
  documentId,
  userId,
  requestId,
}: ProcessDocumentParams) {
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
    console.log(
      {
        requestId,
        documentId,
        userId,
      },
      "Already processed",
    );

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
     * Validate File
     * -----------------------------------
     */

    await validateFile({
      buffer,

      expectedMimeType: document.fileType,
    });

    /**
     * -----------------------------------
     * Parse File
     * -----------------------------------
     */

    const text = await parseFile(buffer, document.fileType);

    if (!text || text.trim().length < parserConfig.minExtractedTextLength) {
      throw new Error("Document contains insufficient readable content");
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

    console.log(
      {
        requestId,
        documentId,
        userId,
      },
      "Document processed",
    );
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

    console.error(
      {
        requestId,
        documentId,
        userId,
        error: message,
      },
      "Document processing failed",
    );

    throw err;
  }
}
