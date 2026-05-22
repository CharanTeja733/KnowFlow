import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { documentTable } from "./documents.schema";

export const conversationTable = pgTable(
  "conversations",

  {
    id: uuid().primaryKey().defaultRandom(),

    documentId: uuid()
      .notNull()
      .references(() => documentTable.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id").notNull(),

    question: text().notNull(),

    answer: text().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);
