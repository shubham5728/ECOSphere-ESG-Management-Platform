import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createEnvironmentalGoalSchema, updateEnvironmentalGoalSchema } from "./environmentalGoal.schema";

const crud = createCrud(prisma.environmentalGoal, {
  label: "Environmental Goal",
  searchFields: ["title", "description"],
  sortableFields: ["title", "targetValue", "currentValue", "unit", "deadline", "status", "createdAt"],
  defaultSort: "createdAt",
  include: { department: true },
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createEnvironmentalGoalSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateEnvironmentalGoalSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
