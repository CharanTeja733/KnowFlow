import { openai } from "./client";
import { aiConfig } from "@repo/config";

export async function summarizeChunk(chunk: string) {
  const response = await openai.chat.completions.create({
    model: aiConfig.summarization.model,
    messages: [
      {
        role: "system",
        content: aiConfig.prompts.summarizeChunk,
      },
      {
        role: "user",
        content: chunk,
      },
    ],
    temperature: aiConfig.summarization.temperature,
  });

  return response.choices[0]?.message?.content || "";
}
