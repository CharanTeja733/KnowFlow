import { HeadObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from "./s3";

import { env } from "@repo/env";

export async function verifyUploadedObject(storageKey: string) {
  try {
    const response = await s3.send(
      new HeadObjectCommand({
        Bucket: env.AWS_S3_BUCKET,

        Key: storageKey,
      }),
    );

    return {
      exists: true,

      contentType: response.ContentType,

      fileSize: response.ContentLength,
    };
  } catch {
    return {
      exists: false,
    };
  }
}
