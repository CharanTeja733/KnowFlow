import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./users.schema";
import { documentStatusEnum } from "./enums";

export const documentTable = pgTable("documents", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  storageKey: text("storage_key").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  status: documentStatusEnum("status").default("UPLOADING").notNull(),
  summary: text(),
  error: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
