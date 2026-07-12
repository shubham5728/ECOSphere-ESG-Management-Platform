import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import * as authService from "./auth.service";

export async function signupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.signup(req.body);
    return sendSuccess(res, result, "Account created successfully", 201);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, "Logged in successfully");
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.sub);
    return sendSuccess(res, user, "OK");
  } catch (err) {
    next(err);
  }
}

// Stateless JWT: logout is handled client-side by discarding the token.
export function logoutHandler(_req: Request, res: Response) {
  return sendSuccess(res, null, "Logged out successfully");
}
