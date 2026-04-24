import * as pdfParseModule from "pdf-parse";

export async function parseFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const pdfParse = (pdfParseModule as any).default ?? (pdfParseModule as any);
    const data = await pdfParse(buffer as any);
    return data.text;
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type");
}