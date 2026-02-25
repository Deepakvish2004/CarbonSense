// widget/renderer/utils/syncService.js
import axios from "axios";

// Backend base URL
const API_BASE = "http://localhost:5000/api/emission";

export async function sendEmissionData(userId, data) {
  try {
    const payload = {
      userId,                         // required
      cpuLoad: data.cpuLoad,
      batteryPercent: data.batteryPercent,
      powerUsage: data.powerUsage,    // ✅ FIX
      co2Emission: data.co2Emission,
      source: "electron_widget",      // ✅ FIX
      timestamp: new Date().toISOString(), // ✅ FIX
    };

    await axios.post(`${API_BASE}/widget`, payload);

    console.log("✅ Emission data saved to backend:", payload);
    return true;
  } catch (err) {
    console.error("❌ Failed to sync emission:", err.message);
    return false;
  }
}
