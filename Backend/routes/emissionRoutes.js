// backend/routes/emissionRoutes.js
const express = require("express");
const router = express.Router();
const Emission = require("../models/Emission");
const sendHighEmissionAlert = require("../services/sendHighEmissionAlert");

// Widget alert limit (1 KG)
const EMISSION_LIMIT = 1; // Send email when co2Emission >= 1 kg

router.post("/widget", async (req, res) => {
  try {
    const { userId, userEmail, cpuLoad, batteryPercent, co2Emission } = req.body;

    // Validate inputs
    if (!userId || co2Emission === undefined) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Save emission entry
    await new Emission({
      userId,
      cpuLoad,
      batteryPercent,
      co2Emission,
      timestamp: new Date(),
    }).save();

    // Send alert when emission is 1kg or more
    if (userEmail && co2Emission >= EMISSION_LIMIT) {
      console.log("🔥 Emission crossed 1 KG → sending email alert...");
      await sendHighEmissionAlert(userEmail, co2Emission);
    }

    res.status(200).json({
      message: "Emission logged successfully",
      currentEmission: co2Emission,
    });

  } catch (err) {
    console.error("Error saving emission:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
