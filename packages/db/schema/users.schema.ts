import {pgTable, varchar, uuid, timestamp, text, pgEnum, integer, vector} from "drizzle-orm/pg-core";

export const userTable = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({length: 255}).notNull(),
    email: varchar({length: 255}).unique().notNull(),
    password: varchar().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date())
});

/*
const chunksTable = pgTable('chunks', {
    id: uuid().primaryKey(),
    documentId: uuid().references(() => documentTable.id),
    content: text(),
    // embedding: vector('embedding').notNull(),
    chunkIndex: integer(),
    createdAt:  timestamp()
})  

*/