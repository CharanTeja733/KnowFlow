import { conversationRepository } from "@repo/db/repositories";

const MAX_HISTORY = 5;

type BuildConversationContextInput = {
  documentId: string;
  userId: string;
};

export async function buildConversationContext({
  documentId,
  userId,
}: BuildConversationContextInput) {
  /**
   * -----------------------------------
   * Fetch recent conversations
   * -----------------------------------
   */

  const conversations = await conversationRepository.findRecentByDocument({
    documentId,

    userId,

    limit: MAX_HISTORY,
  });

  /**
   * -----------------------------------
   * No history
   * -----------------------------------
   */

  if (conversations.length === 0) {
    return "";
  }

  /**
   * -----------------------------------
   * Build context
   * -----------------------------------
   */

  return conversations

    .map(
      ({ question, answer }) =>
        `User: ${question}

Assistant: ${answer}`,
    )

    .join("\n\n");
}
