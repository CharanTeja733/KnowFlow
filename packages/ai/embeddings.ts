import pLimit from "p-limit";

import { openai } from "./client";

const limit = pLimit(3);

const BATCH_SIZE = 20;

export async function createEmbeddings(chunks: string[]) {
  const batches: string[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    batches.push(chunks.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map((batch) =>
      limit(async () => {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",

          input: batch,
        });

        return response.data.map((item) => item.embedding);
      }),
    ),
  );

  return results.flat();
}
