import {
  chunkRepository,
  documentRepository,
  conversationRepository,
} from "@repo/db/repositories";
import { createEmbeddings } from "@repo/ai/embeddings";
import { askQuestion } from "@repo/ai/chat";
import { buildConversationContext } from "./buildConversationContext";
type ChatWithDocumentParams = {
  documentId: string;
  userId: string;
  question: string;
};

export async function chatWithDocument({
  documentId,
  userId,
  question,
}: ChatWithDocumentParams) {
  /**
   * -----------------------------------
   * Verify ownership
   * -----------------------------------
   */

  const document = await documentRepository.findById(documentId, userId);

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.status !== "COMPLETED") {
    throw new Error("Document processing not completed");
  }

  /**
   * -----------------------------------
   * Generate question embedding
   * -----------------------------------
   */

  const [queryEmbedding] = await createEmbeddings([question]);

  if (!queryEmbedding) {
    throw new Error("Failed to generate query embedding");
  }

  /**
   * -----------------------------------
   * Retrieve chunks
   * -----------------------------------
   */

  const chunks = await chunkRepository.findRelevantChunks({
    documentId,

    embedding: queryEmbedding,

    limit: 5,
  });

  if (chunks.length === 0) {
    return {
      answer: "No relevant information found.",

      sources: [],
    };
  }

  /**
   * -----------------------------------
   * Build Document context
   * -----------------------------------
   */

  const documentContext = chunks.map((chunk) => chunk.content).join("\n\n");

  /**
   * -----------------------------------
   * Build Conversation context
   * -----------------------------------
   */
  const conversationContext = await buildConversationContext({
    documentId,
    userId,
  });
  /**
   * -----------------------------------
   * Generate answer
   * -----------------------------------
   */

  const answer = await askQuestion({
    question,

    context: `

Previous conversation:

${conversationContext}

Document context:

${documentContext}

  `,
  });

  await conversationRepository.create({
    documentId,
    userId,
    question,
    answer,
  });

  return {
    answer,

    sources: chunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,

      similarity: chunk.similarity,
    })),
  };
}

// conversation service
export async function getChatHistoryService({
  documentId,
  userId,
}: {
  documentId: string;
  userId: string;
}) {
  return conversationRepository.findByDocument({
    documentId,
    userId,
  });
}
