import db from "@repo/db";

import {
  documentTable,
} from "@repo/db/schema";

import { eq } from "drizzle-orm";

export async function markDocumentProcessing(
  documentId: string
) {
  await db
    .update(documentTable)
    .set({
      status: "PROCESSING",
      error: null,
    })
    .where(
      eq(
        documentTable.id,
        documentId
      )
    );
}

export async function markDocumentCompleted(
  documentId: string,
  summary: string
) {
  await db
    .update(documentTable)
    .set({
      status: "COMPLETED",
      summary,
      error: null,
    })
    .where(
      eq(
        documentTable.id,
        documentId
      )
    );
}

export async function markDocumentFailed(
  documentId: string,
  error: string
) {
  await db
    .update(documentTable)
    .set({
      status: "FAILED",
      error,
    })
    .where(
      eq(
        documentTable.id,
        documentId
      )
    );
}