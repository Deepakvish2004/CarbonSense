import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/ai", async (req, res) => {
  try {
    const { location, temperature, humidity, aqi } = req.body;

    const prompt = `
      Analyze carbon emission impact for:
      Location: ${location}
      Temperature: ${temperature}°C
      Humidity: ${humidity}%
      AQI: ${aqi}

      Give:
      - Whether emission is high or low in this region
      - AC/Heater expected usage
      - Pollution contribution
      - Recommendations to reduce CO2
    `;

    const aiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const reply =
      aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis available";

    res.json({ reply });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;
