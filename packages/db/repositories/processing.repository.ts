import db from "../index";

import {
  documentProcessingTable,
} from "../schema";

import { eq } from "drizzle-orm";

export const processingRepository = {
  async start(
    documentId: string,
    totalChunks: number
  ) {
    await db
      .insert(
        documentProcessingTable
      )
      .values({
        documentId,
        totalChunks,
        completedChunks: 0,
      })
      .onConflictDoUpdate({
        target:
          documentProcessingTable.documentId,

        set: {
          totalChunks,
          completedChunks: 0,
        },
      });
  },

  async updateProgress(
    documentId: string,
    completedChunks: number
  ) {
    await db
      .update(
        documentProcessingTable
      )
      .set({
        completedChunks,
      })
      .where(
        eq(
          documentProcessingTable.documentId,
          documentId
        )
      );
  },

  async clear(
    documentId: string
  ) {
    await db
      .delete(
        documentProcessingTable
      )
      .where(
        eq(
          documentProcessingTable.documentId,
          documentId
        )
      );
  },
};