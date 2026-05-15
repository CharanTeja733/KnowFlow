import { fileTypeFromBuffer } from "file-type";

import { parserConfig } from "@repo/config/parser.config";

type ValidateFileParams = {
  buffer: Buffer;

  expectedMimeType: string;
};

export async function validateFile({
  buffer,
  expectedMimeType,
}: ValidateFileParams) {
  /**
   * -----------------------------------
   * Validate File Size
   * -----------------------------------
   */

  if (buffer.length === 0) {
    throw new Error("File is empty");
  }

  if (buffer.length > parserConfig.maxFileSize) {
    throw new Error("File exceeds maximum size");
  }

  /**
   * -----------------------------------
   * Validate Allowed Mime Type
   * -----------------------------------
   */

  if (!parserConfig.allowedMimeTypes.includes(expectedMimeType)) {
    throw new Error("Unsupported file type");
  }

  /**
   * -----------------------------------
   * Detect Actual File Type
   * -----------------------------------
   */

  const detectedType = await fileTypeFromBuffer(buffer);

  /**
   * -----------------------------------
   * Some text files may return undefined
   * -----------------------------------
   */

  if (expectedMimeType === "text/plain") {
    return;
  }

  /**
   * -----------------------------------
   * Could Not Detect Type
   * -----------------------------------
   */

  if (!detectedType) {
    throw new Error("Could not determine file type");
  }

  /**
   * -----------------------------------
   * Validate Actual Mime Type
   * -----------------------------------
   */

  if (detectedType.mime !== expectedMimeType) {
    throw new Error(
      `Invalid file type: expected ${expectedMimeType}, received ${detectedType.mime}`,
    );
  }
}
