import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { userTable } from "./users.schema";
import { status } from "./enums";

export const documentTable = pgTable("documents", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  name: text().notNull(),
  fileUrl: text("file_url").unique().notNull(),
  fileSize: integer().notNull(),
  fileType: text("file_type").notNull(),
  status: status().default("PENDING").notNull(),
  summary: text(),
  error: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
