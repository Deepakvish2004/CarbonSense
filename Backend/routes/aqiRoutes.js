import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/aqi", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}`;

    const result = await axios.get(url);

    // No results available
    if (!result.data.results || result.data.results.length === 0) {
      return res.json({
        status: "no-data",
        message: "AQI data not available for this location",
        results: []
      });
    }

    res.json(result.data);
  } catch (err) {
    console.error("AQI Error:", err.message);
    res.json({
      status: "error",
      message: "Error fetching AQI data",
      results: []
    });
  }
});

export default router;
