import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateSettingsSchema } from "./settings.schema";
import * as controller from "./settings.controller";

const router = Router();

// Any authenticated user can read (app-wide config). Only Admin can change.
router.get("/", authenticate, controller.getSettingsHandler);
router.patch(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(updateSettingsSchema),
  controller.updateSettingsHandler
);

export default router;
