import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authenticate, authorize } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { createCrud } from "../crud.factory";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./department.schema";

const crud = createCrud(prisma.department, {
  label: "Department",
  searchFields: ["name", "code"],
  sortableFields: ["name", "code", "employeeCount", "status", "createdAt"],
  defaultSort: "createdAt",
  include: {
    head: { select: { id: true, name: true } },
    parent: { select: { id: true, name: true } },
  },
});

const router = Router();

// Read: any authenticated user. Write: Admin only.
router.get("/", authenticate, crud.list);
router.get("/:id", authenticate, crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createDepartmentSchema), crud.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateDepartmentSchema), crud.update);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
