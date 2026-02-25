import express from "express";
import Emission from "../models/Emission.js";

const router = express.Router();

router.get("/widget/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Emission.find({ userId }).sort({ timestamp: -1 });

    const total = data.reduce((s, i) => s + i.co2Emission, 0);
    const avg = data.length ? total / data.length : 0;
    const latest = data[0] || null;

    res.json({
      total: total.toFixed(3),
      average: avg.toFixed(3),
      latest,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ error: "Widget fetch failed" });
  }
});

export default router;
