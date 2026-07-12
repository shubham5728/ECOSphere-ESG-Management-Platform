import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createRewardSchema, updateRewardSchema } from "./reward.schema";

const crud = createCrud(prisma.reward, {
  label: "Reward",
  searchFields: ["name", "description"],
  sortableFields: ["name", "pointsRequired", "stock", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createRewardSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateRewardSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
