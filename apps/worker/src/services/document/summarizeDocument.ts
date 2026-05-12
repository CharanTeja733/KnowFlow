import pLimit from "p-limit";

import {
  chunkText,
} from "@repo/ai/chunk";

import {
  summarizeChunk,
} from "@repo/ai/summarizeChunk";

import {
  combineSummaries,
} from "@repo/ai/combineSummaries";

import {
  withTimeout,
} from "../../utils/timeout";

const CHUNK_CONCURRENCY = 5;

const AI_TIMEOUT = 15000;

type ProgressCallback = (
  completedChunks: number,
  totalChunks: number
) => Promise<void>;

type SummarizeDocumentOptions = {
  onProgress?: ProgressCallback;
};

export async function summarizeDocument(
  text: string,
  options?: SummarizeDocumentOptions
) {
  const chunks = chunkText(text);

  const totalChunks =
    chunks.length;

  const limit = pLimit(
    CHUNK_CONCURRENCY
  );

  let completedChunks = 0;

  const summaries =
    await Promise.all(
      chunks.map((chunk) =>
        limit(async () => {
          const summary =
            await withTimeout(
              summarizeChunk(chunk),
              AI_TIMEOUT
            );

          completedChunks++;

          if (
            options?.onProgress
          ) {
            await options.onProgress(
              completedChunks,
              totalChunks
            );
          }

          return summary;
        })
      )
    );

  const finalSummary =
    await withTimeout(
      combineSummaries(
        summaries
      ),
      AI_TIMEOUT
    );

  return {
    summary: finalSummary,
    totalChunks,
  };
}