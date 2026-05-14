import { z } from "zod";

export const uploadDocumentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    fileUrl: z.url("Invalid file URL"),
    fileSize: z.number().positive("File size must be > 0"),
    fileType: z.string().min(1, "File type is required"),
  }),
});

export const getDocumentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const deleteDocumentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const createDocumentSchema = z.object({
  userId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().positive(),
});

export type CreateDocument = z.infer<typeof createDocumentSchema> & {
  fileBuffer: Buffer;
};

export type Document = z.infer<typeof uploadDocumentSchema>["body"];
