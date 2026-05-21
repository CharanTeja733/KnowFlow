import db from "../index";

import { chunkTable } from "../schema";

import { eq, sql } from "drizzle-orm";

type CreateChunkInput = {
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding: number[];
};

type FindRelevantChunksInput = {
  documentId: string;
  embedding: number[];
  limit: number;
};
export const chunkRepository = {
  async createMany(chunks: CreateChunkInput[]) {
    if (chunks.length === 0) {
      return;
    }

    await db.insert(chunkTable).values(chunks);
  },

  async findByDocumentId(documentId: string) {
    return db
      .select()
      .from(chunkTable)
      .where(eq(chunkTable.documentId, documentId));
  },

  async deleteByDocumentId(documentId: string) {
    await db.delete(chunkTable).where(eq(chunkTable.documentId, documentId));
  },

  async findRelevantChunks({
    documentId,
    embedding,
    limit = 5,
  }: FindRelevantChunksInput) {
    const similarity = sql<number>`
    1 - (
      ${chunkTable.embedding}
      <=> ${embedding}
    )
  `;

    return db
      .select({
        content: chunkTable.content,

        chunkIndex: chunkTable.chunkIndex,

        similarity,
      })
      .from(chunkTable)

      .where(eq(chunkTable.documentId, documentId))

      .orderBy(
        sql`
        ${chunkTable.embedding}
        <=> ${embedding}
      `,
      )

      .limit(limit);
  },
};
