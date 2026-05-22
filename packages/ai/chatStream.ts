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
          Answer only from context.
          Say you don't know if information is unavailable.
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
