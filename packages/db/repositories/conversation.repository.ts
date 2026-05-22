import { conversationTable } from "../schema";
import db from "../index";

type CreateConversationParams = {
  userId: string;
  documentId: string;
  question: string;
  answer: string;
};

export const conversationRepository = {
  async create({
    documentId,
    userId,
    question,
    answer,
  }: CreateConversationParams) {
    await db.insert(conversationTable).values({
      documentId,

      userId,

      question,

      answer,
    });
  },

  async findByDocument({
    documentId,
    userId,
  }: {
    documentId: string;
    userId: string;
  }) {
    return db.query.conversationTable.findMany({
      where: (conversation, { and, eq }) =>
        and(
          eq(conversation.documentId, documentId),

          eq(conversation.userId, userId),
        ),

      orderBy: (conversation, { asc }) => [asc(conversation.createdAt)],
    });
  },

  async findRecentByDocument({
    documentId,
    userId,
    limit = 5,
  }: {
    documentId: string;
    userId: string;
    limit: number;
  }) {
    return db.query.conversationTable.findMany({
      where: (conversation, { and, eq }) =>
        and(
          eq(conversation.documentId, documentId),

          eq(conversation.userId, userId),
        ),

      orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],

      limit,
    });
  },
};
