import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { loginSchema, signupSchema } from "./auth.schema";
import * as controller from "./auth.controller";

const router = Router();

router.post("/signup", validate(signupSchema), controller.signupHandler);
router.post("/login", validate(loginSchema), controller.loginHandler);
router.get("/me", authenticate, controller.meHandler);
router.post("/logout", authenticate, controller.logoutHandler);

export default router;
