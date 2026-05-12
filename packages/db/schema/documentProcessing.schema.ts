import {
  pgTable,
  uuid,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

import { documentTable }
from "./documents.schema";

export const documentProcessingTable =
  pgTable("document_processing", {
      documentId: uuid("document_id").primaryKey().references(() => documentTable.id, {onDelete: "cascade",}),
      totalChunks: integer("total_chunks").notNull(),
      completedChunks: integer("completed_chunks").notNull().default(0),

      startedAt: timestamp("started_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    });