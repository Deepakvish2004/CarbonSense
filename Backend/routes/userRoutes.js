import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import Alert from "../models/Alert.js";
import User from "../models/userModel.js";

const router = express.Router();

/* -------------------------------------------
   AUTH ROUTES
-------------------------------------------- */
router.post("/register", registerUser);
router.post("/login", loginUser);

/* -------------------------------------------
   GET USER ALERTS (MAILBOX)
   URL → /api/users/alerts
-------------------------------------------- */
router.get("/alerts", protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ message: "Failed to load alerts" });
  }
});

/* -------------------------------------------
   USER RESPONDS ACTIVE / INACTIVE (FINAL)
   URL → /api/users/alerts/respond
-------------------------------------------- */
router.post("/alerts/respond", protect, async (req, res) => {
  try {
    const { alertId, response } = req.body;

    if (!["Active", "Inactive"].includes(response)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    const alert = await Alert.findOne({
      _id: alertId,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // 🔄 UPDATE ALERT (MATCH ADMIN LOGIC)
    alert.status = "Responded";
    alert.userResponse = response;
    await alert.save();

    // 🔄 UPDATE USER
    const user = await User.findById(req.user._id);

    user.activityStatus = response;
    user.reminderCount = 0; // reset reminder counter
    user.lastReminderSentAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${response}`,
    });
  } catch (err) {
    console.error("Error responding to alert:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;
