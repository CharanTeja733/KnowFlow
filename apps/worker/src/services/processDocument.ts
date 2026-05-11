import  db  from "@repo/db";
import { documentTable } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { fetchFileAsBuffer } from "@repo/storage/fetchFile";
import { parseFile } from "@repo/parser/parse";
import { summarize } from "@repo/ai/summarize";
import { withTimeout } from "apps/worker/src/utils/timeout";

export async function processDocument(
  documentId: string,
  userId: string
) {
  //1. Get document
  const [document] = await db
    .select()
    .from(documentTable)
    .where(and(eq(documentTable.id, documentId), eq(documentTable.userId, userId)));

  if (!document) {
    throw new Error("Document not found");
  }

  //2. Idempotency check
  if (document.status === "COMPLETED") {
    console.log("Already processed:", documentId);
    return;
  }

  try {
    //3. Update status → PROCESSING
    await db.update(documentTable)
      .set({ status: "PROCESSING" })
      .where(eq(documentTable.id, documentId));

    //4. Fetch file from S3
    const buffer = await fetchFileAsBuffer(document.fileUrl);

    //5. Extract text
    const text = await parseFile(buffer, document.fileType);

    if (!text || text.trim().length === 0) {
      throw new Error("No readable content found in file");
    }

    //6. Summarize using AI
    const summary = await withTimeout(
      summarize(text),
      15000
    );


    //7. Save result
    await db.update(documentTable)
      .set({
        status: "COMPLETED",
        summary,
        error: null,
      })
      .where(eq(documentTable.id, documentId));

    console.log("✅ Document processed:", documentId);

  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    //8. Update status → FAILED
    await db.update(documentTable)
      .set({
        status: "FAILED",
        error: message,
      })
      .where(eq(documentTable.id, documentId));

    console.error(" Processing failed:", documentId, message);

    throw err; // allow BullMQ retry
  }
}