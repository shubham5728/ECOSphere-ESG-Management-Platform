import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createEsgPolicySchema, updateEsgPolicySchema } from "./esgPolicy.schema";

const crud = createCrud(prisma.eSGPolicy, {
  label: "ESG Policy",
  searchFields: ["title", "description"],
  sortableFields: ["title", "version", "effectiveDate", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createEsgPolicySchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateEsgPolicySchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
