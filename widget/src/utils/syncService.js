// widget/renderer/utils/syncService.js
import axios from "axios";

// Your backend base URL (adjust if needed)
const API_BASE = "http://localhost:5000/api/emission";

export async function sendEmissionData(userId, data) {
  try {
    const payload = {
      userId,
      cpuLoad: data.cpuLoad,
      batteryPercent: data.batteryPercent,
      co2Emission: data.co2Emission,
    };

    await axios.post(`${API_BASE}/widget`, payload);
    console.log("✅ Emission data synced:", payload);
  } catch (err) {
    console.error("❌ Failed to sync emission:", err.message);
  }
}
