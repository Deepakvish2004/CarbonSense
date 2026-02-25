import express from "express";
import { createActivity, getActivities, clearActivities } from "../controllers/activityController.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/log", protectAdmin, createActivity);
router.get("/", protectAdmin, getActivities);
router.delete("/clear", protectAdmin, clearActivities);

export default router;
