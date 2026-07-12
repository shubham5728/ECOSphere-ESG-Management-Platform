import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

const crud = createCrud(prisma.category, {
  label: "Category",
  searchFields: ["name"],
  sortableFields: ["name", "type", "status", "createdAt"],
  defaultSort: "createdAt",
});

const router = Router();

router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateCategorySchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
