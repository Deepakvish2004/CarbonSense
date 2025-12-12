import express from "express";
import LocationReport from "../models/LocationReport.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// SAVE REPORT
router.post("/report", async (req, res) => {
  try {
    const {
      userId,
      lat,
      lon,
      locationName,
      temperature,
      humidity,
      aqi,
      aiInsight,
      riskScore,
      riskLabel
    } = req.body;

    const report = new LocationReport({
      userId,
      lat,
      lon,
      locationName,
      temperature,
      humidity,
      aqi,
      aiInsight,
      riskScore,
      riskLabel,
    });

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    console.error("Save report error:", err);
    res.status(500).json({ success: false, message: "Could not save report" });
  }
});

// GET REPORTS for specific user
router.get("/reports/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    const reports = await LocationReport.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, reports });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false });
  }
});

// GET all reports (optional)
router.get("/reports", async (req, res) => {
  try {
    const reports = await LocationReport.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, reports });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
