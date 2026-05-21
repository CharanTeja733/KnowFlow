import {
  documentRepository,
  processingRepository,
  chunkRepository,
} from "@repo/db/repositories";

import { downloadFile } from "@repo/storage/download";

import { parseFile } from "@repo/parser/parse";
import { validateFile } from "@repo/parser/validate";
import { parserConfig } from "@repo/config/parser.config";
import { chunkText } from "@repo/ai/chunk";
import { createEmbeddings } from "@repo/ai/embeddings";
import { summarizeDocument } from "./summarizeDocument";

import {
  publishDocumentProcessing,
  publishDocumentProgress,
  publishDocumentCompleted,
  publishDocumentFailed,
} from "@repo/events";

import { logger } from "@repo/logger";

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
  const documentLogger = logger.child({
    requestId,
    documentId,
    userId,
  });
  /**
   * -----------------------------------
   * Fetch Document
   * -----------------------------------
   */

  documentLogger.info("Started processing");

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
    documentLogger.info("Already processed");

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
     * Process AI Tasks
     * -----------------------------------
     */

    let processingInitialized = false;

    const chunks = chunkText(text);

    const onProgress = async (completedChunks: number, totalChunks: number) => {
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
    };

    const [result, embeddings] = await Promise.all([
      summarizeDocument(chunks, {
        onProgress,
      }),

      createEmbeddings(chunks),
    ]);

    /**
     * -----------------------------------
     * Persist Chunks
     * -----------------------------------
     */

    if (chunks.length !== embeddings.length) {
      throw new Error("Chunk and embedding count mismatch");
    }

    const chunkRows = chunks.map((chunk, index) => {
      const embedding = embeddings[index];

      if (!embedding) {
        throw new Error(`Missing embedding for chunk ${index}`);
      }

      return {
        documentId,

        content: chunk,

        chunkIndex: index,

        embedding,
      };
    });

    await chunkRepository.createMany(chunkRows);

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

    documentLogger.info("Document processed");
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

    documentLogger.error({ err: message }, "Failed");

    throw err;
  }
}
