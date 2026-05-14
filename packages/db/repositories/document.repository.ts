import db from "../index";

import { documentTable } from "../schema";

import { eq, and } from "drizzle-orm";

export const documentRepository = {
  async create(data: {
    userId: string;
    name: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    status: "PENDING";
  }) {
    const [document] = await db.insert(documentTable).values(data).returning();

    if (!document) {
      throw new Error("Failed to create document");
    }

    return document;
  },

  async findById(documentId: string, userId: string) {
    const [document] = await db
      .select()
      .from(documentTable)
      .where(
        and(eq(documentTable.id, documentId), eq(documentTable.userId, userId)),
      );

    return document;
  },

  async findManyByUserId(userId: string) {
    return db
      .select()
      .from(documentTable)
      .where(eq(documentTable.userId, userId));
  },

  async delete(documentId: string, userId: string) {
    const result = await db
      .delete(documentTable)
      .where(
        and(eq(documentTable.id, documentId), eq(documentTable.userId, userId)),
      );

    return result;
  },

  async markProcessing(documentId: string) {
    await db
      .update(documentTable)
      .set({
        status: "PROCESSING",
        error: null,
      })
      .where(eq(documentTable.id, documentId));
  },

  async markCompleted(documentId: string, summary: string) {
    await db
      .update(documentTable)
      .set({
        status: "COMPLETED",
        summary,
        error: null,
      })
      .where(eq(documentTable.id, documentId));
  },

  async markFailed(documentId: string, error: string) {
    await db
      .update(documentTable)
      .set({
        status: "FAILED",
        error,
      })
      .where(eq(documentTable.id, documentId));
  },
};
