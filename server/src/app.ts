import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { sendSuccess } from "./utils/apiResponse";
import authRoutes from "./modules/auth/auth.routes";
import departmentRoutes from "./modules/master/departments/department.routes";

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

  // Fallbacks
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
