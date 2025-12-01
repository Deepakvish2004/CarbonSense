import express from "express";
import AlertSettings from "../models/AlertSettings.js";

const router = express.Router();

// GET alert settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await AlertSettings.findOne();

    if (!settings) {
      return res.json({
        enabled: true,
        alert10: 10,
        alert15: 15,
      });
    }

    res.json(settings);
  } catch (err) {
    console.log("Settings Fetch Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// SAVE alert settings
router.post("/settings", async (req, res) => {
  try {
    const { enabled, alert10, alert15 } = req.body;

    let settings = await AlertSettings.findOne();

    if (!settings) {
      settings = new AlertSettings({ enabled, alert10, alert15 });
    } else {
      settings.enabled = enabled;
      settings.alert10 = alert10;
      settings.alert15 = alert15;
    }

    await settings.save();
    res.json({ message: "Settings Updated", settings });
  } catch (err) {
    console.log("Settings Save Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
