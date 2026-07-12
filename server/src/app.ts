import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { sendSuccess } from "./utils/apiResponse";
import authRoutes from "./modules/auth/auth.routes";
import departmentRoutes from "./modules/master/departments/department.routes";
import categoryRoutes from "./modules/master/categories/category.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import userRoutes from "./modules/users/user.routes";
import emissionFactorRoutes from "./modules/master/emissionFactors/emissionFactor.routes";
import esgPolicyRoutes from "./modules/master/esgPolicies/esgPolicy.routes";
import badgeRoutes from "./modules/master/badges/badge.routes";
import rewardRoutes from "./modules/master/rewards/reward.routes";
import productESGProfileRoutes from "./modules/master/productESGProfiles/productESGProfile.routes";
import environmentalGoalRoutes from "./modules/master/environmentalGoals/environmentalGoal.routes";
import environmentalRoutes from "./modules/environmental/environmental.routes";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) =>
    sendSuccess(res, { status: "ok", uptime: process.uptime() }, "Server healthy")
  );

  // Feature routes
  app.use("/api/auth", authRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/emission-factors", emissionFactorRoutes);
  app.use("/api/esg-policies", esgPolicyRoutes);
  app.use("/api/badges", badgeRoutes);
  app.use("/api/rewards", rewardRoutes);
  app.use("/api/product-esg-profiles", productESGProfileRoutes);
  app.use("/api/environmental-goals", environmentalGoalRoutes);
  app.use("/api/environmental", environmentalRoutes);

  // Fallbacks
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
