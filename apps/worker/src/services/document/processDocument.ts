import db from "@repo/db";

import {
  documentTable,
} from "@repo/db/schema";

import {
  eq,
  and,
} from "drizzle-orm";

import {
  fetchFileAsBuffer,
} from "@repo/storage/fetchFile";

import {
  parseFile,
} from "@repo/parser/parse";

import {
  summarizeDocument,
} from "./summarizeDocument";

import {
  startProcessingState,
  updateProcessingProgress,
  clearProcessingState,
} from "./processingState";

import {
  markDocumentProcessing,
  markDocumentCompleted,
  markDocumentFailed,
} from "./documentPersistence";

import {
  publishDocumentProcessing,
  publishDocumentProgress,
  publishDocumentCompleted,
  publishDocumentFailed,
} from "@repo/events";

export async function processDocument(
  documentId: string,
  userId: string
) {
  /**
   * -----------------------------------
   * Fetch Document
   * -----------------------------------
   */

  const [document] = await db
    .select()
    .from(documentTable)
    .where(
      and(
        eq(documentTable.id, documentId),
        eq(documentTable.userId, userId)
      )
    );

  if (!document) {
    throw new Error(
      "Document not found"
    );
  }

  /**
   * -----------------------------------
   * Idempotency
   * -----------------------------------
   */

  if (
    document.status === "COMPLETED"
  ) {
    console.log(
      "Already processed:",
      documentId
    );

    return;
  }

  try {
    /**
     * -----------------------------------
     * Update Status
     * -----------------------------------
     */

    await markDocumentProcessing(
      documentId
    );

    await publishDocumentProcessing(
      documentId
    );

    /**
     * -----------------------------------
     * Fetch File
     * -----------------------------------
     */

    const buffer =
      await fetchFileAsBuffer(
        document.fileUrl
      );

    /**
     * -----------------------------------
     * Parse File
     * -----------------------------------
     */

    const text = await parseFile(
      buffer,
      document.fileType
    );

    if (
      !text ||
      text.trim().length === 0
    ) {
      throw new Error(
        "No readable content found"
      );
    }

    /**
     * -----------------------------------
     * Summarize
     * -----------------------------------
     */

    let processingInitialized =
      false;

    const result =
      await summarizeDocument(
        text,
        {
          onProgress: async (
            completedChunks,
            totalChunks
          ) => {
            /**
             * Initialize processing state
             * once total chunks known
             */

            if (
              !processingInitialized
            ) {
              await startProcessingState(
                documentId,
                totalChunks
              );

              processingInitialized =
                true;
            }

            /**
             * Persist progress
             */

            await updateProcessingProgress(
              documentId,
              completedChunks
            );

            /**
             * Publish realtime event
             */

            await publishDocumentProgress(
              documentId,
              completedChunks,
              totalChunks
            );
          },
        }
      );

    /**
     * -----------------------------------
     * Save Summary
     * -----------------------------------
     */

    await markDocumentCompleted(
      documentId,
      result.summary
    );

    /**
     * -----------------------------------
     * Cleanup Processing State
     * -----------------------------------
     */

    await clearProcessingState(
      documentId
    );

    /**
     * -----------------------------------
     * Publish Completion
     * -----------------------------------
     */

    await publishDocumentCompleted(
      documentId,
      result.summary
    );

    console.log(
      "✅ Document processed:",
      documentId
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error";

    /**
     * -----------------------------------
     * Persist Failure
     * -----------------------------------
     */

    await markDocumentFailed(
      documentId,
      message
    );

    /**
     * -----------------------------------
     * Cleanup Processing State
     * -----------------------------------
     */

    await clearProcessingState(
      documentId
    );

    /**
     * -----------------------------------
     * Publish Failure
     * -----------------------------------
     */

    await publishDocumentFailed(
      documentId,
      message
    );

    console.error(
      "❌ Processing failed:",
      documentId,
      message
    );

    throw err;
  }
}