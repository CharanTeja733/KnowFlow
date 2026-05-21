import pLimit from "p-limit";

import { summarizeChunk } from "@repo/ai/summarizeChunk";

import { combineSummaries } from "@repo/ai/combineSummaries";

import { withTimeout } from "../../utils/timeout";

import { aiConfig } from "@repo/config/ai.config";
const CHUNK_CONCURRENCY = aiConfig.summarization.concurrency;

const AI_TIMEOUT = aiConfig.summarization.timeoutMs;

type ProgressCallback = (
  completedChunks: number,
  totalChunks: number,
) => Promise<void>;

type SummarizeDocumentOptions = {
  onProgress?: ProgressCallback;
};

export async function summarizeDocument(
  chunks: string[],
  options?: SummarizeDocumentOptions,
) {
  const totalChunks = chunks.length;

  const limit = pLimit(CHUNK_CONCURRENCY);

  let completedChunks = 0;

  let lastReportedProgress = 0;

  const summaries = await Promise.all(
    chunks.map((chunk) =>
      limit(async () => {
        const summary = await withTimeout(summarizeChunk(chunk), AI_TIMEOUT);

        completedChunks++;

        const progress = Math.floor((completedChunks / totalChunks) * 100);

        const shouldReport =
          progress === 100 || progress - lastReportedProgress >= 10;

        if (shouldReport && options?.onProgress) {
          lastReportedProgress = progress;

          await options.onProgress(completedChunks, totalChunks);
        }

        return summary;
      }),
    ),
  );

  const finalSummary = await withTimeout(
    combineSummaries(summaries),
    AI_TIMEOUT,
  );

  return {
    summary: finalSummary,
    totalChunks,
  };
}
