import { openai } from "./client";
import { aiConfig } from "@repo/config";

export async function combineSummaries(summaries: string[]) {
  const combinedText = summaries.join("\n");

  const response = await openai.chat.completions.create({
    model: aiConfig.summarization.model,
    messages: [
      {
        role: "system",
        content: aiConfig.prompts.combineSummary,
      },
      {
        role: "user",
        content: combinedText,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}