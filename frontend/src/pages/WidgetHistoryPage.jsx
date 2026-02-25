import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "../components/DashboardHeader";
import API_BASE from "../api/config";

export default function WidgetHistoryPage() {
  const [widgetData, setWidgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function fetchWidgetHistory() {
      try {
        const res = await axios.get(
          `${API_BASE}/api/emission/widget`
        );
        setWidgetData(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch widget history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWidgetHistory();
  }, []);

  const selectedItem = widgetData.find(i => i._id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <DashboardHeader />

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mt-6">
        <h2 className="text-2xl font-bold text-blue-700">
          ⚙️ Widget Emission History
        </h2>
        <p className="text-sm text-gray-600">
          Double-click a card to expand into detail view
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-10 text-gray-500">Loading widget data…</p>
      )}

      {/* GRID */}
      {!loading && (
        <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetData.map(item => (
            <motion.div
              key={item._id}
              layout
              layoutId={item._id}
              onDoubleClick={() => setSelectedId(item._id)}
              className="bg-white rounded-xl shadow-lg p-5 cursor-pointer
                         hover:shadow-xl transition"
            >
              <h3 className="font-semibold text-blue-600">
                🖥 System Snapshot
              </h3>

              <p className="text-sm mt-2">
                CPU Load: <strong>{item.cpuLoad ?? "—"}%</strong>
              </p>

              <div className="mt-3 text-center">
                <span className="px-4 py-1 rounded-full bg-blue-600 text-white font-bold">
                  {item.co2Emission.toFixed(3)} kg CO₂
                </span>
              </div>

              <p className="text-xs text-gray-400 text-center mt-3">
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* FIXED DETAIL AREA */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            layout
            layoutId={selectedItem._id}
            className="fixed bottom-6 left-1/2 -translate-x-1/2
                       w-[95%] max-w-4xl bg-white rounded-2xl
                       shadow-2xl p-6 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-700">
                🔍 Detailed System Snapshot
              </h3>
              <button
                onClick={() => setSelectedId(null)}
                className="text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>🧠 CPU Load: <strong>{selectedItem.cpuLoad ?? "—"}%</strong></p>
              <p>🔋 Battery: <strong>{selectedItem.batteryPercent ?? "—"}%</strong></p>
              <p>⚡ Power Usage: <strong>{selectedItem.powerUsage ?? "—"} W</strong></p>
              <p>🌱 CO₂ Emission: <strong>{selectedItem.co2Emission.toFixed(3)} kg</strong></p>
              <p className="md:col-span-2 text-gray-500">
                🕒 {new Date(selectedItem.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
