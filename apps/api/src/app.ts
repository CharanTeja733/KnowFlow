import express from "express";
import { registerRoutes } from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.middlewares";

const app = express();

app.use(express.json());

registerRoutes(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;