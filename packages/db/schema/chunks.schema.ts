import {pgTable, varchar, uuid, timestamp,boolean, text, pgEnum, integer, vector, date} from "drizzle-orm/pg-core";
import { documentTable } from "./documents.schema";


export const chunksTable = pgTable('chunks', {
    id: uuid().primaryKey(),
    documentId: uuid().references(() => documentTable.id),
    content: text(),
    // embedding: vector('embedding').notNull(),
    chunkIndex: integer(),
    createdAt:  timestamp()
})  
