import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { s3 }
from "./s3";

import { env }
from "@repo/env";

export async function
downloadFile(
  storageKey: string
) {
  const response =
    await s3.send(
      new GetObjectCommand({
        Bucket:
          env.AWS_S3_BUCKET,

        Key:
          storageKey,
      })
    );

  if (!response.Body) {
    throw new Error(
      "File not found"
    );
  }

  const chunks:
    Uint8Array[] = [];

  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}