import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import * as settingsService from "./settings.service";

export async function getSettingsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, settings, "OK");
  } catch (err) {
    next(err);
  }
}

export async function updateSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.updateSettings(req.body);
    return sendSuccess(res, settings, "Settings updated successfully");
  } catch (err) {
    next(err);
  }
}
