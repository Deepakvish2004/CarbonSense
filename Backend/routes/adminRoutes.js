import express from "express";
import User from "../models/userModel.js";
import Footprint from "../models/footprintModel.js";
import Alert from "../models/Alert.js";
import Activity from "../models/activityModel.js"; // ✅ REQUIRED
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { sendReminderEmail } from "../utils/sendReminderEmail.js";

const router = express.Router();

/* ===========================================
   USERS
=========================================== */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ===========================================
   FOOTPRINTS (🔥 THIS FIXES YOUR ERROR)
=========================================== */
router.get("/footprints", protectAdmin, async (req, res) => {
  try {
    const footprints = await Footprint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(footprints);
  } catch (err) {
    console.error("Footprint fetch error:", err);
    res.status(500).json({ message: "Failed to fetch footprints" });
  }
});

router.delete("/footprints/:id", protectAdmin, async (req, res) => {
  try {
    await Footprint.findByIdAndDelete(req.params.id);
    res.json({ message: "Footprint deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete footprint" });
  }
});

/* ===========================================
   ADMIN ACTIVITY LOGS
=========================================== */
router.get("/activity", protectAdmin, async (req, res) => {
  try {
    const logs = await Activity.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

router.post("/activity/log", protectAdmin, async (req, res) => {
  try {
    const { action, target } = req.body;

    await Activity.create({
      admin: req.admin._id,
      action,
      target,
    });

    res.status(201).json({ message: "Activity logged" });
  } catch (err) {
    res.status(500).json({ message: "Failed to log activity" });
  }
});

router.delete("/activity/clear", protectAdmin, async (req, res) => {
  try {
    await Activity.deleteMany({});
    res.json({ message: "All logs cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear logs" });
  }
});

/* ===========================================
   USERS + ACTIVITY STATUS (🔥 MISSING ROUTE)
=========================================== */
router.get("/users/activity", protectAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select(
      "name email lastLogin activityStatus reminderCount"
    );

    const usersWithAlert = await Promise.all(
      users.map(async (u) => {
        const pendingAlert = await Alert.findOne({
          userId: u._id,
          alertType: "LOGIN_REMINDER",
          status: "Pending",
        }).select("reminderCount autoEmailSent");

        return {
          ...u.toObject(),
          pendingAlert: pendingAlert || null,
        };
      })
    );

    res.json(usersWithAlert);
  } catch (err) {
    console.error("❌ users/activity error:", err);
    res.status(500).json({ message: "Failed to fetch users activity" });
  }
});


/* ===========================================
   SEND USER REMINDER
=========================================== */
router.post("/send-reminder", protectAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let alert = await Alert.findOne({
      userId,
      alertType: "LOGIN_REMINDER",
      status: "Pending",
    });

    if (!alert) {
      alert = await Alert.create({
        userId,
        alertType: "LOGIN_REMINDER",
        message: "Please check your dashboard",
        reminderCount: 1,
      });
    } else {
      alert.reminderCount += 1;
    }

    if (alert.reminderCount > 5 && !alert.autoEmailSent) {
      await sendReminderEmail(user.email);
      alert.autoEmailSent = true;
    }

    await alert.save();
    res.json({ message: "Reminder sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send reminder" });
  }
});

export default router;
