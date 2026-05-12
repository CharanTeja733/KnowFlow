import db from "../index";

import {
  chunkTable,
} from "../schema";

import { eq } from "drizzle-orm";

export const chunkRepository = {
  async createMany(
    documentId: string,
    chunks: string[]
  ) {
    if (chunks.length === 0) {
      return;
    }

    await db
      .insert(chunkTable)
      .values(
        chunks.map(
          (content, index) => ({
            documentId,
            content,
            chunkIndex: index,
          })
        )
      );
  },

  async findByDocumentId(
    documentId: string
  ) {
    return db
      .select()
      .from(chunkTable)
      .where(
        eq(
          chunkTable.documentId,
          documentId
        )
      );
  },

  async deleteByDocumentId(
    documentId: string
  ) {
    await db
      .delete(chunkTable)
      .where(
        eq(
          chunkTable.documentId,
          documentId
        )
      );
  },
};