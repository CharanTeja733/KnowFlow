import db from "@repo/db";

import {
  documentProcessingTable,
} from "@repo/db/schema";

import { eq } from "drizzle-orm";

export async function startProcessingState(
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
}

export async function updateProcessingProgress(
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
}

export async function clearProcessingState(
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
}