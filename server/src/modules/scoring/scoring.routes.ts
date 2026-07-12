import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/apiResponse";
import * as scoringService from "./scoring.service";

const router = Router();

router.get("/breakdown", authenticate, async (_req, res, next) => {
  try {
    const scores = await scoringService.calculateEsgScores();
    return sendSuccess(res, scores, "ESG scoring engine breakdown fetched successfully");
  } catch (err) {
    next(err);
  }
});

export default router;
