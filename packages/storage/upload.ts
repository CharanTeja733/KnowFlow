import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";
import { env } from "@repo/env";

export async function uploadToS3({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET!;

  // unique file key
  const key = `documents/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  //  public URL (basic version)
  return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}