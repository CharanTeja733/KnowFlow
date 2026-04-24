import { openai } from "./client";

export async function summarizeChunk(chunk: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Summarize this part of a document briefly.",
      },
      {
        role: "user",
        content: chunk,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "";
}