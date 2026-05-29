// import type { Request, Response, NextFunction } from "express";
// import type { ZodTypeAny, infer as zInfer } from "zod";
// import { ApiError } from "../utils/ApiError";

// export function validate<T extends ZodTypeAny>(schema: T) {
//   return function (
//     req: Request,
//     res: Response,
//     next: NextFunction,
//   ) {
//     const result = schema.safeParse({
//       body: req.body,
//       query: req.query,
//       params: req.params,
//     });

//     if (!result.success) {
//       const message = result.error.issues
//         .map((i) => `${i.path.join(".")}: ${i.message}`)
//         .join(", ");
//       return next(new ApiError(400, message));
//     }

//     const data: zInfer<T> = result.data;

//     /**
//      * Safe mutation
//      */
//     Object.assign(req.body, (data as any).body);

//     Object.assign(req.query, (data as any).query);

//     Object.assign(req.params, (data as any).params);

//     if (data.body) {
//       Object.assign(req.body, data.body);
//     }

//     if (data.query) {
//       Object.assign(req.query, data.query);
//     }

//     if (data.params) {
//       Object.assign(req.params, data.params);
//     }

//     return next();
//   };
// }

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { ApiError } from "../utils/ApiError";

// type RequestSchema = z.ZodObject<{
//   body: z.ZodOptional<z.ZodTypeAny>;
//   query: z.ZodOptional<z.ZodTypeAny>;
//   params: z.ZodOptional<z.ZodTypeAny>;
// }>;

type RequestSchema = z.ZodObject<
  Partial<{
    body: z.ZodTypeAny;
    query: z.ZodTypeAny;
    params: z.ZodTypeAny;
  }>
>;
export function validate<T extends RequestSchema>(schema: T) {
  return function (req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return next(new ApiError(400, message));
    }

    const data = result.data;

    if (data.body) {
      Object.assign(req.body, data.body);
    }

    if (data.query) {
      Object.assign(req.query, data.query);
    }

    if (data.params) {
      Object.assign(req.params, data.params);
    }

    return next();
  };
}
