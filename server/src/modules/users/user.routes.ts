import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCrud } from "../master/crud.factory";
import { createUserSchema, updateUserSchema } from "./user.schema";

const userDelegate = {
  findMany: async (args: any) => {
    const users = await prisma.user.findMany(args);
    return users.map(({ passwordHash, ...u }) => u);
  },
  findUnique: async (args: any) => {
    const user = await prisma.user.findUnique(args);
    if (!user) return null;
    const { passwordHash, ...u } = user;
    return u;
  },
  count: (args: any) => prisma.user.count(args),
  create: async (args: any) => {
    const user = await prisma.user.create(args);
    const { passwordHash, ...u } = user;
    return u;
  },
  update: async (args: any) => {
    const user = await prisma.user.update(args);
    const { passwordHash, ...u } = user;
    return u;
  },
  delete: (args: any) => prisma.user.delete(args),
};

const crud = createCrud(userDelegate, {
  label: "User",
  searchFields: ["name", "email"],
  sortableFields: ["name", "email", "role", "status", "createdAt"],
  defaultSort: "createdAt",
  include: { department: true },
});

const router = Router();

const handleCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.password) {
      req.body.passwordHash = await hashPassword(req.body.password);
      delete req.body.password;
    }
    return crud.create(req, res, next);
  } catch (err) {
    next(err);
  }
};

const handleUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.password === "") {
      delete req.body.password;
    }
    if (req.body.password) {
      req.body.passwordHash = await hashPassword(req.body.password);
      delete req.body.password;
    }
    return crud.update(req, res, next);
  } catch (err) {
    next(err);
  }
};

// Admin only routes
router.get("/", authenticate, authorize("ADMIN"), crud.list);
router.get("/:id", authenticate, authorize("ADMIN"), crud.getOne);
router.post("/", authenticate, authorize("ADMIN"), validate(createUserSchema), handleCreate);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateUserSchema), handleUpdate);
router.delete("/:id", authenticate, authorize("ADMIN"), crud.remove);

export default router;
