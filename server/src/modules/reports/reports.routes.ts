import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess } from "../../utils/apiResponse";
import { generateReportSchema } from "./reports.schema";
import * as reportsService from "./reports.service";

const router = Router();

router.post(
  "/generate",
  authenticate,
  validate(generateReportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await reportsService.generateEsgReport(req.body);
      return sendSuccess(res, data, "ESG custom report generated successfully");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
