import express  from "express";
import * as controllers from "./auth.controllers";
import { validate } from "../../middlewares/validation.middleware";
import * as schema from "./auth.schema";
import { forgotPasswordLimiter, loginLimiter } from "@/middlewares/ratelimiter";

const router = express.Router();

router.post('/signup', validate(schema.signupSchema), controllers.signupController);
router.post('/signin', validate(schema.signinSchema), controllers.signinController);


router.post('/register', validate(schema.registerSchema), controllers.registerController);
router.get('/verify-email', validate(schema.emailVerificationSchema), controllers.verificationController);

router.post('/login',loginLimiter, validate(schema.loginSchema), controllers.loginController)
router.post('/refresh-token', controllers.refreshTokenController)
router.post('/logout', controllers.logoutController)

router.post('/forgot-password',forgotPasswordLimiter, validate(schema.forgotPasswordSchema), controllers.forgotPasswordController)
router.post('/reset-password', validate(schema.resetPasswordSchema), controllers.resetPasswordController)

export default router;