import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny, infer as zInfer } from "zod";
import { ApiError } from "../utils/ApiError";

export function validate<T extends ZodTypeAny>(schema: T) {
  return function (req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      return next(new ApiError(400, message));
    }

    const data: zInfer<T> = result.data;

    req.body = (data as any).body;
    req.query = (data as any).query;
    req.params = (data as any).params;

    return next();
  };
}
