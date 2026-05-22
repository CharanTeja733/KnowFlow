import { openai } from "./client";

type AskQuestionInput = {
  question: string;
  context: string;
};

export async function askQuestion({
  question,
  context,
}: AskQuestionInput): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    messages: [
      {
        role: "system",

        content: `

Answer using the provided document context.

Use previous conversation only
for conversational continuity.

Do not invent facts.

If information is unavailable,
say you don't know.

`,
      },

      {
        role: "user",
        content: `

Context:

${context}

Question:

${question}

`,
      },
    ],
  });

  const answer = completion.choices[0]?.message?.content;

  if (!answer) {
    throw new Error("OpenAI returned empty response");
  }

  return answer;
}
