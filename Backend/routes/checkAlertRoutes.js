import express from "express";
import mongoose from "mongoose";
import Footprint from "../models/footprintModel.js";
import Alert from "../models/Alert.js";
import sendHighEmissionAlert from "../services/sendHighEmissionAlert.js";

const router = express.Router();

/*
  ============================
  ADMIN ALERT SETTINGS ROUTES
  ============================
*/

// GET current settings
router.get("/settings", async (req, res) => {
  try {
    let settings = await Alert.findOne({ isSetting: true });

    if (!settings) {
      settings = await Alert.create({
        isSetting: true,
        alert10: 10,
        alert15: 15,
        enabled: true
      });
    }

    return res.json({
      alert10: settings.alert10,
      alert15: settings.alert15,
      enabled: settings.enabled
    });

  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// SAVE updated settings
router.post("/settings", async (req, res) => {
  try {
    const { alert10, alert15, enabled } = req.body;

    let settings = await Alert.findOne({ isSetting: true });

    if (!settings) {
      settings = new Alert({ isSetting: true });
    }

    settings.alert10 = alert10;
    settings.alert15 = alert15;
    settings.enabled = enabled;

    await settings.save();

    return res.json({ success: true, message: "Settings saved" });

  } catch (err) {
    console.error("SAVE SETTINGS ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

/*
  ============================
  USER ALERT LOGIC
  ============================
*/

router.post("/check-total", async (req, res) => {
  console.log("🔥 ALERT API HIT");

  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "Missing userId or userEmail" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Load settings
    let settings = await Alert.findOne({ isSetting: true });

    if (!settings) {
      settings = await Alert.create({
        isSetting: true,
        alert10: 10,
        alert15: 15,
        enabled: true
      });
    }

    if (!settings.enabled) {
      return res.json({ message: "Alerts disabled by admin" });
    }

    // Get total emissions
    const totalAgg = await Footprint.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: null, total: { $sum: "$co2Emission" } } }
    ]);

    const total = totalAgg[0]?.total || 0;

    // Load or create user alert record
    let userAlert = await Alert.findOne({
      isSetting: false,
      userId: userObjectId,
    });

    if (!userAlert) {
      userAlert = await Alert.create({
        isSetting: false,
        userId: userObjectId,
        alert10Sent: false,
        alert15Sent: false,
      });
    }

    let alert10Sent = false;
    let alert15Sent = false;

    // First limit (send only once)
    if (total >= settings.alert10 && !userAlert.alert10Sent) {
      await sendHighEmissionAlert(userEmail, total, `${settings.alert10} KG LIMIT REACHED`);
      userAlert.alert10Sent = true;
      alert10Sent = true;
    }

    // Second limit (send every login)
    if (total >= settings.alert15) {
      await sendHighEmissionAlert(userEmail, total, `${settings.alert15} KG CRITICAL LIMIT`);
      alert15Sent = true;
    }

    await userAlert.save();

    return res.json({
      totalEmission: total,
      alert10Sent,
      alert15Sent,
      adminConfig: {
        alert10: settings.alert10,
        alert15: settings.alert15,
      }
    });

  } catch (err) {
    console.error("❌ ALERT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
