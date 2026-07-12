import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createEmissionFactorSchema, updateEmissionFactorSchema } from "./emissionFactor.schema";

const crud = createCrud(prisma.emissionFactor, {
  label: "Emission Factor",
  searchFields: ["name", "source"],
  sortableFields: ["name", "source", "unit", "factor", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createEmissionFactorSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateEmissionFactorSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
