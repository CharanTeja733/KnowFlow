import express from "express";
import * as controllers from "./auth.controllers";
import { validate } from "../../middlewares/validation.middleware";
import * as schema from "./auth.schema";
import { forgotPasswordLimiter, loginLimiter } from "@/middlewares/ratelimiter";
import { ensureAuthenticated } from "@/middlewares/authentication.middlewares";

const router = express.Router();

router.post(
  "/register",
  validate(schema.registerSchema),
  controllers.registerController,
);
router.get(
  "/verify-email",
  validate(schema.emailVerificationSchema),
  controllers.verificationController,
);

router.post(
  "/login",
  loginLimiter,
  validate(schema.loginSchema),
  controllers.loginController,
);
router.post("/refresh-token", controllers.refreshTokenController);
router.post("/logout", ensureAuthenticated, controllers.logoutController);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(schema.forgotPasswordSchema),
  controllers.forgotPasswordController,
);
router.post(
  "/reset-password",
  validate(schema.resetPasswordSchema),
  controllers.resetPasswordController,
);

export default router;
