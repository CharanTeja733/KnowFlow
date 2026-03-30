import { eq, and } from 'drizzle-orm';
import db from '@repo/db';
import { documentTable } from '@repo/db/schema';
import type { CreateDocument, Document } from './document.schema';
import { documentQueue } from "@repo/queue/document.queue";
import {uploadToS3} from "@repo/storage/upload";


export async function uploadDocument(document: Document, userId: string) {
    const [documentDetails] = await db
    .insert(documentTable)
    .values({
        ...document,
        userId
    })
    .returning({
        documentId: documentTable.id, 
        name: documentTable.name
    });

    return documentDetails
}

export async function getDocuments(userId: string) {
    const documents = await db
        .select()
        .from(documentTable)
        .where(eq(documentTable.userId, userId));

    return documents;    
}

export async function getDocument(documentId: string, userId: string) {

    const [document] = await db
        .select()
        .from(documentTable)
        .where(and(eq(documentTable.userId, userId), eq(documentTable.id, documentId)));

    return document;   
}

export async function deleteDocument(documentId: string, userId: string) {
    const result =   await db
        .delete(documentTable)
        .where(and(eq(documentTable.userId, userId), eq(documentTable.id, documentId)));
    
    if(result.rowCount === 0) {
        throw new Error('Document not found');
    }
}


export async function createDocument({
  userId,
  fileBuffer,
  fileName,
  mimeType,
  size,
}: CreateDocument) {
  // 👉 Upload to storage (replace with S3 later)
    const fileUrl = await uploadToS3({
        buffer: fileBuffer,
        fileName,
        mimeType,
    });

  const [document] = await db.insert(documentTable).values({
    userId,
    name: fileName,
    fileUrl,
    fileSize: size,
    fileType: mimeType,
    status: "PENDING",
  }).returning();

  if(!document) {
    throw new Error("Something went wrong in db")
  }

  // 👉 Add job to queue
   await documentQueue.add(
    "process-document",
    {
      documentId: document.id,
      userId,
    },
    {
      attempts: 3, // retry
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: document.id, // avoid duplicates
    }
  );

  return document;
}

