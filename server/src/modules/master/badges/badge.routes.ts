import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createBadgeSchema, updateBadgeSchema } from "./badge.schema";

const crud = createCrud(prisma.badge, {
  label: "Badge",
  searchFields: ["name", "description"],
  sortableFields: ["name", "unlockRule", "threshold", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createBadgeSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateBadgeSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
