import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { AppError } from "./errorHandler";

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Require a valid Bearer JWT. Attaches req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

/** Require the authenticated user to have one of the allowed roles. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
}
