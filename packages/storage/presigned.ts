import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { randomUUID } from "crypto";

import { s3 } from "./s3";

import { env } from "@repo/env";

import { storageConfig } from "@repo/config/storage.config";

type GenerateUploadUrlParams = {
  userId: string;

  fileName: string;

  mimeType: string;
};

export async function generateUploadUrl({
  userId,
  fileName,
  mimeType,
}: GenerateUploadUrlParams) {
  // Validate mime type
  if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
    throw new Error("Unsupported file type");
  }

  // Generate object key
  const key = `documents/${userId}/${randomUUID()}-${fileName}`;

  // Create presigned POST
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: env.AWS_S3_BUCKET,

    Key: key,

    Expires: storageConfig.presignedExpiresIn,

    Conditions: [
      ["content-length-range", 0, storageConfig.maxFileSize],

      ["eq", "$Content-Type", mimeType],
    ],

    Fields: {
      "Content-Type": mimeType,
    },
  });

  return {
    url,
    fields,

    key,

    maxFileSize: storageConfig.maxFileSize,
  };
}
