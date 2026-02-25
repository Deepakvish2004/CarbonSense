import express from "express";
import Emission from "../models/Emission.js";
import sendHighEmissionAlert from "../services/sendHighEmissionAlert.js";

const router = express.Router();


const EMISSION_LIMIT = 1000;

router.post("/widget", async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      cpuLoad,
      batteryPercent,
      powerUsage,
      co2Emission,
      source,
      timestamp,
    } = req.body;

  
    if (!userId || co2Emission === undefined) {
      return res.status(400).json({
        error: "userId and co2Emission are required",
      });
    }

    
    const emissionRecord = await Emission.create({
      userId,
      source: source || "electron_widget",
      cpuLoad,
      batteryPercent,
      powerUsage,
      co2Emission,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

  
    if (userEmail && co2Emission >= EMISSION_LIMIT) {
      console.log("🔥 High emission → sending alert");
      await sendHighEmissionAlert(userEmail, co2Emission);
    }

    res.status(201).json({
      success: true,
      message: "Widget emission data saved",
      id: emissionRecord._id,
    });
  } catch (err) {
    console.error("❌ Error saving widget emission:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ================= FETCH WIDGET DATA =================
router.get("/widget", async (req, res) => {
  try {
    const data = await Emission.find({ source: "electron_widget" })
      .sort({ timestamp: -1 });

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error fetching widget data:", err);
    res.status(500).json({ error: "Failed to fetch widget data" });
  }
});

export default router;
