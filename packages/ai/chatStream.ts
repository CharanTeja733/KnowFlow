import { openai } from "./client";

type AskQuestionStreamParams = {
  question: string;
  context: string;

  onChunk: (chunk: string) => Promise<void>;
};

export async function askQuestionStream({
  question,
  context,
  onChunk,
}: AskQuestionStreamParams) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    stream: true,

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

  let fullAnswer = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;

    if (!content) {
      continue;
    }

    fullAnswer += content;

    await onChunk(content);
  }

  return fullAnswer;
}
