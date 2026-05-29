import type { Request, Response } from "express";

export async function healthController(req: Request, res: Response) {
  return res.status(200).json({
    success: true,

    message: "Server is healthy",

    timestamp: new Date().toISOString(),
  });
}
