import { z } from "zod";

export const chatSchema = {
  body: z.object({
    question: z.string().trim().min(3),
  }),
};
