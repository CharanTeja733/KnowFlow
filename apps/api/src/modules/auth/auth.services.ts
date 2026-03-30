import db from  '@repo/db';
import {userTable} from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import type { Signup } from './auth.schema';
export async function getUserByEmail(email: string) {
    const [user]  = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

    return user;
}

export async function createUser(user: Signup) {
    const [createdUser] = await db
        .insert(userTable)
        .values({ ...user})
        .returning({
            name: userTable.name, 
            email: userTable.email,
            id: userTable.id
        });
        
    return createdUser;
}