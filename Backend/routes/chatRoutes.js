import express from "express";
import axios from "axios";
import dotenv from "dotenv";

import ChatMessage from "../models/ChatMessage.js";
import User from "../models/userModel.js";
import Footprint from "../models/footprintModel.js";
import Waste from "../models/Waste.js";
import Alert from "../models/AlertSettings.js";
import mongoose from "mongoose";

dotenv.config();
const router = express.Router();

/* -------------------------------------------------------
   FETCH USER DATA
------------------------------------------------------- */
async function getUserData(userId) {
  if (!userId) return {};

  const user = await User.findById(userId).lean();
  const devices = await Footprint.find({ user: userId }).lean();
  const wastes = await Waste.find({ user: userId }).lean();

  const deviceEmission = devices.reduce((s, f) => s + (f.co2Emission || 0), 0);
  const wasteEmission = wastes.reduce((s, f) => s + (f.co2Emission || 0), 0);
  const totalEmission = deviceEmission + wasteEmission;

  const seven = new Date();
  seven.setDate(seven.getDate() - 7);

  const grouped = await Footprint.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: seven }
      }
    },
    { $group: { _id: null, total: { $sum: "$co2Emission" } } }
  ]);

  const last7 = grouped[0]?.total || 0;
  const dailyAvg = last7 / 7 || 0;

  return {
    user,
    devices,
    wastes,
    deviceEmission,
    wasteEmission,
    totalEmission,
    prediction: {
      dailyAvg,
      next7days: dailyAvg * 7,
    },
  };
}

/* -------------------------------------------------------
   MENU OPTIONS (FULL LIST)
------------------------------------------------------- */
function getMainOptions() {
  return [
    { label: "Show device emission", value: "device emission" },
    { label: "Show waste emission", value: "waste emission" },
    { label: "Show combined emission", value: "combined emission" },
    { label: "Predict next 7 days", value: "prediction" },
    { label: "Why is my emission high?", value: "why high" },
    { label: "How can I reduce emission?", value: "reduce emission" },
    { label: "Which device emits the most?", value: "highest device" },
    { label: "Reset memory", value: "reset memory" },
    { label: "How many logs?", value: "count logs" },
  ];
}

/* -------------------------------------------------------
   SMART OPTION ENGINE — ONLY 4 OPTIONS
------------------------------------------------------- */
function getSmartOptions(data) {
  const all = getMainOptions();
  let priority = [];

  // HIGH DEVICE EMISSION
  if (data.deviceEmission > 30) {
    priority.push(
      "why high",
      "reduce emission",
      "highest device",
      "device emission"
    );
  }

  // HIGH WASTE EMISSION
  if (data.wasteEmission > 10) {
    priority.push(
      "waste emission",
      "why high",
      "reduce emission"
    );
  }

  // NORMAL EMISSION
  if (data.deviceEmission <= 30 && data.wasteEmission <= 10) {
    priority.push(
      "prediction",
      "device emission",
      "combined emission"
    );
  }

  // DEFAULT PRIORITY
  if (priority.length === 0) {
    priority = [
      "device emission",
      "combined emission",
      "prediction",
      "reduce emission"
    ];
  }

  let priorityOptions = all.filter((o) => priority.includes(o.value));
  priorityOptions = priorityOptions.sort(() => Math.random() - 0.5);

  const selectedPriority = priorityOptions.slice(0, 2);

  const remaining = all.filter((o) => !selectedPriority.includes(o));
  const randomRemaining = remaining.sort(() => Math.random() - 0.5);
  const selectedRandom = randomRemaining.slice(0, 2);

  return [...selectedPriority, ...selectedRandom];
}

/* -------------------------------------------------------
   FORMULA EXPLANATION
------------------------------------------------------- */
function getFormulaExplanation() {
  return `
Emission Formula Used:

1) Device Emission:
   CO₂ = (Power Rating (W) / 1000) × Hours × 0.475 kg

2) Waste Emission:
   Plastic → 6 kg CO₂ per kg
   Organic → 0.25 kg CO₂ per kg
   Metal → 1.85 kg CO₂ per kg

3) Prediction:
   Next 7 days = (Last 7 days average) × 7
`;
}

/* -------------------------------------------------------
   WHY EMISSION IS HIGH
------------------------------------------------------- */
function explainHighEmission(data) {
  const reasons = [];

  if (data.deviceEmission > 30)
    reasons.push(`• Device emission is high (${data.deviceEmission} kg).`);

  if (data.wasteEmission > 10)
    reasons.push(`• Waste emission is high (${data.wasteEmission} kg).`);

  return reasons.length
    ? `Reasons for high emission:\n\n${reasons.join("\n")}\n\nTry reducing usage & waste.`
    : "Your emission is normal. 😊";
}

/* -------------------------------------------------------
   REDUCTION TIPS
------------------------------------------------------- */
function getReductionTips() {
  return `
Here’s how to reduce your carbon footprint:

✔ Reduce electricity usage  
✔ Use energy efficient devices  
✔ Avoid unnecessary device runtime  
✔ Reduce plastic waste  
✔ Compost organic waste  
✔ Follow 3R principles  
✔ Limit AC usage  

Small steps → Big Impact 🌱
`;
}

/* -------------------------------------------------------
   RESET MEMORY
------------------------------------------------------- */
async function resetUserMemory(userId) {
  await ChatMessage.deleteMany({
    userId,
    sender: "bot",
    text: { $regex: /Your name is/i }
  });
}

/* -------------------------------------------------------
   CHAT ROUTE
------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const text = message?.toLowerCase().trim() || "";

    const data = await getUserData(userId);

    /* RESET MEMORY */
    if (text === "reset memory") {
      await resetUserMemory(userId);
      return res.json({
        reply: "Memory reset successfully.",
        options: getSmartOptions(data),
      });
    }

    /* NAME HANDLING — ONLY ONCE */
    const nameQuestions = [
      "what is my name",
      "my name",
      "tell my name",
      "who am i",
      "what's my name"
    ];

    const previousNameReply = await ChatMessage.findOne({
      userId,
      sender: "bot",
      text: { $regex: /Your name is/i }
    });

    if (nameQuestions.includes(text)) {
      if (!previousNameReply) {
        return res.json({
          reply: `Your name is ${data.user?.name}. 😊`,
          options: getSmartOptions(data),
        });
      }
      return res.json({
        reply:
          "Let's focus on your carbon insights instead. Ask things like:\n• device emission\n• waste emission\n• prediction\n• reduce emission",
        options: getSmartOptions(data),
      });
    }

    /* BLOCK OTHER PERSONAL INFO */
    const restrictedPersonal = ["email", "phone", "address", "location"];
    if (restrictedPersonal.some((w) => text.includes(w))) {
      return res.json({
        reply: "Sorry, I cannot provide personal details.",
        options: getSmartOptions(data),
      });
    }

    /* GREETINGS */
    const greetings = ["hi", "hello", "hey", "hlo"];
    if (greetings.includes(text)) {
      return res.json({
        reply: "Yes, what can I help you with?",
        options: getSmartOptions(data),
      });
    }

    /* FIXED RESPONSES */
    if (text === "device emission")
      return res.json({
        reply: `Your device emission is ${data.deviceEmission} kg.`,
        options: getSmartOptions(data),
      });

    if (text === "waste emission")
      return res.json({
        reply: `Your waste emission is ${data.wasteEmission} kg.`,
        options: getSmartOptions(data),
      });

    if (text === "combined emission")
      return res.json({
        reply: `Your combined emission is ${data.totalEmission} kg.`,
        options: getSmartOptions(data),
      });

    if (text === "count logs")
      return res.json({
        reply: `You have ${data.devices.length} device logs & ${data.wastes.length} waste logs.`,
        options: getSmartOptions(data),
      });

    if (text === "prediction")
      return res.json({
        reply: `Next 7 days emission: ${data.prediction.next7days.toFixed(2)} kg.`,
        options: getSmartOptions(data),
      });

    if (text === "why high")
      return res.json({
        reply: explainHighEmission(data),
        options: getSmartOptions(data),
      });

    if (text === "reduce emission")
      return res.json({
        reply: getReductionTips(),
        options: getSmartOptions(data),
      });

    if (text === "highest device") {
      const highest = data.devices.sort(
        (a, b) => b.co2Emission - a.co2Emission
      )[0];
      if (!highest)
        return res.json({ reply: "No device logs found.", options: getSmartOptions(data) });

      return res.json({
        reply: `Highest emitting device: ${highest.deviceType} (${highest.co2Emission} kg).`,
        options: getSmartOptions(data),
      });
    }

    if (text.includes("formula"))
      return res.json({
        reply: getFormulaExplanation(),
        options: getSmartOptions(data),
      });

    /* FALLBACK AI */
    const API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = process.env.GEMINI_MODEL;

    const body = {
      contents: [
        {
          parts: [{
            text: `User asked: ${message}. Answer concisely.`
          }]
        }
      ]
    };

    const aiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      body
    );

    const reply =
      aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    return res.json({
      reply,
      options: getSmartOptions(data),
    });

  } catch (err) {
    console.error("Chat Error:", err);
    return res.status(500).json({ error: "Chat Error" });
  }
});

/* -------------------------------------------------------
   CHAT HISTORY
------------------------------------------------------- */
router.get("/history/:userId", async (req, res) => {
  const history = await ChatMessage.find({ userId: req.params.userId });
  res.json({ history });
});

export default router;
