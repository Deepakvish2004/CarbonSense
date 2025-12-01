import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminManageAlerts() {
  const [alert10, setAlert10] = useState(10);
  const [alert15, setAlert15] = useState(15);
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alert/settings");

      setAlert10(res.data.alert10);
      setAlert15(res.data.alert15);
      setEnabled(res.data.enabled);
    } catch (err) {
      console.error("Failed to load alert settings:", err);
    }
  };

  const saveSettings = async () => {
    try {
      await axios.post("http://localhost:5000/api/alert/settings", {
        alert10,
        alert15,
        enabled,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br border-3 border-purple-700 rounded-2xl from-green-50 to-green-200 p-6 flex justify-center">
      <div className="w-full max-w-xl">
        
        <h1 className="text-3xl font-extrabold text-green-700 mb-6 text-center">
          🔔 Manage Alert Settings
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">

          {/* Enable / Disable */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">Enable Alerts:</label>
            <select
              value={enabled}
              onChange={(e) => setEnabled(e.target.value === "true")}
              className="border border-gray-300 p-2 rounded-lg w-full mt-2 focus:ring-2 focus:ring-green-400"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          {/* 10kg Threshold */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">
              10 KG Alert Threshold:
            </label>
            <input
              type="number"
              value={alert10}
              onChange={(e) => setAlert10(Number(e.target.value))}
              className="border border-gray-300 p-2 rounded-lg w-full mt-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* 15kg Critical */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">
              15 KG Critical Alert Threshold:
            </label>
            <input
              type="number"
              value={alert15}
              onChange={(e) => setAlert15(Number(e.target.value))}
              className="border border-gray-300 p-2 rounded-lg w-full mt-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-all"
          >
            Save Settings
          </button>

          {saved && (
            <p className="text-green-600 mt-3 font-semibold text-center">
              ✔ Saved Successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
