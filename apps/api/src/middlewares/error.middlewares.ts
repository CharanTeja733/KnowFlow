import type { Request, Response, NextFunction } from "express";


export async function notFoundHandler(req: Request, res: Response, next: NextFunction) {
    return res.status(404).json({error: "route not found"});
}

export async function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode || 500;

    res
    .status(statusCode)
    .json({
        status: 'error',
        message: err.message || 'Internal Server err',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}