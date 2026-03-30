import { pgEnum } from "drizzle-orm/pg-core";

export const status = pgEnum('status' , ['PENDING', 'PROCESSING', 'COMPLETED','FAILED']);