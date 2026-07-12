import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/apiResponse";
import * as dashboardService from "./dashboard.service";

const router = Router();

// Role-aware overview — returns real aggregated data for the caller's role.
router.get("/overview", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, sub } = req.user!;
    let data;
    if (role === "ADMIN") data = await dashboardService.getAdminOverview();
    else if (role === "MANAGER") data = await dashboardService.getManagerOverview(sub);
    else data = await dashboardService.getEmployeeOverview(sub);
    return sendSuccess(res, data, "Dashboard overview fetched");
  } catch (err) {
    next(err);
  }
});

export default router;
