import {pgTable, uuid, timestamp, text, integer} from "drizzle-orm/pg-core";
import { documentTable } from "./documents.schema";


export const chunkTable = pgTable('chunks', {
    id: uuid().primaryKey().defaultRandom(),
    documentId: uuid("document_id").references(() => documentTable.id),
    content: text().notNull(),
    // embedding: vector('embedding').notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    createdAt:  timestamp("created_at").notNull().defaultNow(),
})  
