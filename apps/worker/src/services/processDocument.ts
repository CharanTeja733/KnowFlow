export async function processDocument(
  documentId: string,
  userId: string
) {
  console.log("Processing:", documentId);

  // 1. update status → PROCESSING
  // 2. fetch file using fileUrl
  // 3. extract text
  // 4. summarize using AI
  // 5. update DB → COMPLETED
}