import express from "express";
import { createActivity, getActivities, clearActivities } from "../controllers/activityController.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import Activity from "../models/activityModel.js";

const router = express.Router();

router.post("/log", protectAdmin, createActivity);
router.get("/", protectAdmin, getActivities);
router.delete("/clear", protectAdmin, clearActivities);

// Delete a single activity log by ID
router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Log deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete log" });
    }
});

export default router;
