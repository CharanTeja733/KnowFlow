import { openai } from "./client";

export async function combineSummaries(summaries: string[]) {
  const combinedText = summaries.join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an expert summarizer.

Combine the following partial summaries into:
- Key Points
- Insights
- Final Conclusion
        `,
      },
      {
        role: "user",
        content: combinedText,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}