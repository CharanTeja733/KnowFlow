import { chunkText } from "./chunk";
import { summarizeChunk } from "./summarizeChunk";
import { combineSummaries } from "./combineSummaries";
import pLimit from "p-limit";

export async function summarize(text: string) {
  const chunks = chunkText(text);

  const limit = pLimit(3); // max 3 parallel calls

  // ⚡ Parallel processing (IMPORTANT)
  const summaries = await Promise.all(
    chunks.map((chunk) => summarizeChunk(chunk))
  );

  const finalSummary = await combineSummaries(summaries);

  return finalSummary;
}

/* for single ai call
import { openai } from "./client";

export async function summarize(text: string): Promise<string> {
  // ⚠️ prevent huge input (important for cost + limits)
  const trimmedText = text.slice(0, 12000);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // fast + cheap
    messages: [
      {
        role: "system",
        content:
          "You are an expert assistant that summarizes documents clearly and concisely.",
      },
      {
        role: "user",
        content: `Summarize the following document:\n\n${trimmedText}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "No summary generated";
}
*/