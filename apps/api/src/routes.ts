import type { Express } from 'express';
import authRouter from './modules/auth/auth.routes';
import documentRouter from './modules/document/document.routes';

export function registerRoutes(app: Express) {
    app.use('/auth', authRouter);
    app.use('/document', documentRouter);
}