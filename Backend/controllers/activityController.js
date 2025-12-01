import asyncHandler from "express-async-handler";
import Activity from "../models/activityModel.js";

// ✅ Create log
export const createActivity = asyncHandler(async (req, res) => {
  const { action, target } = req.body;
  if (!action || !target) {
    res.status(400);
    throw new Error("Missing action or target");
  }

  const log = await Activity.create({
    admin: req.admin._id,
    action,
    target,
  });

  res.status(201).json(log);
});

// ✅ Get all logs
export const getActivities = asyncHandler(async (req, res) => {
  const logs = await Activity.find()
    .populate("admin", "name email")
    .sort({ createdAt: -1 });
  res.json(logs);
});

// ✅ Clear all logs
export const clearActivities = asyncHandler(async (req, res) => {
  await Activity.deleteMany({});
  res.json({ message: "All logs cleared successfully" });
});
