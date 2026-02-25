import express from "express";
import mongoose from "mongoose";
import Footprint from "../models/footprintModel.js";   

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const userObjectId = new mongoose.Types.ObjectId(userId);

   
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

   
    const data = await Footprint.aggregate([
      { $match: { user: userObjectId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$co2Emission" } } }
    ]);

    const last7Total = data.reduce((sum, d) => sum + d.total, 0);

    
    const dailyAvg = last7Total / 7;

 
    const tomorrow = dailyAvg;
    const next7days = dailyAvg * 7;

   
    const totalLifeEmissions = await Footprint.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: null, total: { $sum: "$co2Emission" } } }
    ]);

    const totalOverall = totalLifeEmissions[0]?.total || 0;

    
    const daysTo20Kg = dailyAvg > 0 ? (20 - totalOverall) / dailyAvg : Infinity;
    const daysTo30Kg = dailyAvg > 0 ? (30 - totalOverall) / dailyAvg : Infinity;

    return res.json({
      dailyAvg,
      tomorrow,
      next7days,
      totalOverall,
      daysTo20Kg,
      daysTo30Kg
    });

  } catch (err) {
    console.error("Prediction Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

export default router;
