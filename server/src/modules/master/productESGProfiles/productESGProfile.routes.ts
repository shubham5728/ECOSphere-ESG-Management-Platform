import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createProductESGProfileSchema, updateProductESGProfileSchema } from "./productESGProfile.schema";

const crud = createCrud(prisma.productESGProfile, {
  label: "Product ESG Profile",
  searchFields: ["productName", "category"],
  sortableFields: ["productName", "category", "carbonPerUnit", "recyclablePct", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createProductESGProfileSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateProductESGProfileSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
