import db from "../index";

import { chunkTable } from "../schema";

import { eq } from "drizzle-orm";

type CreateChunkInput = {
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding: number[];
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
};
