import express  from "express";
import { signinController, signupController } from "./auth.controllers";
import { validate } from "../../middlewares/validation.middleware";
import { signinSchema, signupSchema } from "./auth.schema";

const router = express.Router();

router.post('/signup', validate(signupSchema), signupController);
router.post('/signin', validate(signinSchema),signinController);


export default router;