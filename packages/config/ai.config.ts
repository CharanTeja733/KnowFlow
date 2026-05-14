import { env } from "@repo/env";

export const aiConfig = {
  summarization: {
    model: "gpt-4o-mini",

    chunkSize: env.CHUNK_SIZE,

    chunkOverlap: env.CHUNK_OVERLAP,

    concurrency: env.AI_CONCURRENCY,

    timeoutMs: env.AI_TIMEOUT_MS,

    temperature: 0.3,
  },

  prompts: {
    combineSummary: `
You are an expert summarizer.

Combine the following partial summaries into:
- Key Points
- Insights
- Final Conclusion
    `,

    summarizeChunk: `
You are an expert document summarizer.

Summarize the chunk clearly and concisely.
    `,
  },
};