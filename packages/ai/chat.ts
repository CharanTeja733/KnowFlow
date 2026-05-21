import { openai } from "./client";

type AskQuestionInput = {
  question: string;
  context: string;
};

export async function askQuestion({ question, context }: AskQuestionInput) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    messages: [
      {
        role: "system",
        content: `
Answer only from context.
Say you don't know otherwise.
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

  return completion.choices[0].message.content;
}
