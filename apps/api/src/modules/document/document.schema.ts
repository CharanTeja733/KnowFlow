import { z } from "zod";

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
  body: z.object({
    name: z.string().min(1),

    storageKey: z.string().min(1),

    fileSize: z.number().positive(),

    fileType: z.string().min(1),
  }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>["body"];

export const generatePresignedUrlSchema = z.object({
  body: z.object({
    fileName: z.string().min(1),

    mimeType: z.string().min(1),
  }),
});

export type GeneratePresignedUrlInput = z.infer<
  typeof generatePresignedUrlSchema
>["body"];
