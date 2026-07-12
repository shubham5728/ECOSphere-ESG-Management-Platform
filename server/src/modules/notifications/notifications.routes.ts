import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createNotificationSchema } from "./notifications.schema";
import * as svc from "./notifications.service";

const router = Router();

/** GET /api/notifications/me  – my notifications */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const notifications = await svc.getUserNotifications(req.user!.sub);
    res.json(notifications);
  } catch (e) {
    next(e);
  }
});

/** GET /api/notifications/me/unread-count */
router.get("/me/unread-count", authenticate, async (req, res, next) => {
  try {
    const count = await svc.getUnreadCount(req.user!.sub);
    res.json({ count });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/notifications/me/read-all  – mark all as read (must come BEFORE /:id) */
router.patch("/me/read-all", authenticate, async (req, res, next) => {
  try {
    await svc.markAllRead(req.user!.sub);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/notifications/:id/read  – mark single as read */
router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    await svc.markRead(req.params.id, req.user!.sub);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/** POST /api/notifications  – create (Admin only) */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createNotificationSchema),
  async (req, res, next) => {
    try {
      const n = await svc.createNotification(req.body);
      res.status(201).json(n);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
