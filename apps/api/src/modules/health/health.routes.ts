import { Router } from "express";

import { healthController } from "./health.controllers";

const router = Router();

router.get("/", healthController);

export default router;
