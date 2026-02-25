import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";

/* ===============================
   DEVICE IMAGES
================================ */
const deviceImages = {
  laptop: "/images/laptop.png",
  desktop: "/images/desktop.png",
  monitor: "/images/monitor.png",
  display: "/images/monitor.png",
  printer: "/images/printer.png",
  server: "/images/server.png",
  phone: "/images/phone.png",
  other: "/images/device.png",
};

const getDeviceImage = (type = "other") =>
  deviceImages[type.toLowerCase()] || deviceImages.other;

/* ===============================
   IMAGE VARIANTS (MODAL)
================================ */
const deviceImageVariants = {
  phone: ["/images/phone.png", "/images/phone1.png", "/images/phone2.png"],
  laptop: ["/images/laptop.png", "/images/laptop1.png"],
  desktop: ["/images/desktop.png"],
  monitor: ["/images/monitor.png", "/images/monitor1.png"],
  display: ["/images/monitor.png", "/images/display.png"],
  printer: ["/images/printer.png", "/images/printer1.png"],
  server: ["/images/server.png", "/images/server1.png"],
  other: ["/images/device.png"],
};

export default function AllHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("other");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  /* ===============================
     FETCH HISTORY
  ================================ */
  useEffect(() => {
    async function fetchHistory() {
      if (!userInfo?.token) return;

      try {
        const res = await axios.get(
          "http://localhost:5000/api/footprint/history",
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    }

    fetchHistory();
  }, [userInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-6">
      <DashboardHeader userInfo={userInfo} />

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto mt-6 mb-3">
        <h2 className="text-2xl font-bold text-green-700">
          📜 Complete CO₂ Emission History
        </h2>
        <p className="text-sm text-gray-600">
          Switch between card, list, and table formats
        </p>
      </div>

      {/* ✅ FIXED: BUTTON MOVED ABOVE CARDS */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-end">
        <button
          onClick={() => navigate("/widget-history")}
          className="px-5 py-2 rounded-lg
                     bg-gradient-to-r from-blue-500 to-teal-500
                     text-white font-semibold shadow
                     hover:scale-105 transition"
        >
          📊 View Widget Emission History
        </button>
      </div>

      {/* ================= VIEW TOGGLE ================= */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-3">
        {["card", "list", "table"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1 rounded-md capitalize transition-all
              ${
                viewMode === mode
                  ? "bg-green-600 text-white shadow"
                  : "bg-white border hover:bg-green-50"
              }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* ================= CARD VIEW ================= */}
      {viewMode === "card" && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {history.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No emission records found.
            </p>
          )}

          {history.map((item, index) => (
            <div
              key={item._id}
              className="relative transition-all duration-500"
              style={{
                transform: `translateY(${index * 6}px) rotate(${
                  index % 2 === 0 ? "-1.8deg" : "1.8deg"
                })`,
                zIndex: history.length - index,
              }}
            >
              <div className="p-[2px] rounded-3xl bg-gradient-to-br from-green-400 via-teal-400 to-blue-500
                              hover:rotate-0 hover:-translate-y-3 hover:scale-[1.03]
                              transition-all duration-500">
                <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl relative">

                  {/* IMAGE */}
                  <div className="flex justify-center mt-2">
                    <img
                      src={getDeviceImage(item.deviceType)}
                      alt={item.deviceType}
                      className="h-28 object-contain cursor-pointer
                                 transition-transform duration-500 hover:scale-110"
                      onClick={() => {
                        setSelectedDevice(item.deviceType?.toLowerCase() || "other");
                        setIsModalOpen(true);
                      }}
                    />
                  </div>

                  {/* TITLE */}
                  <h3 className="mt-4 text-center text-xl font-bold text-green-700 capitalize">
                    {item.deviceType}
                  </h3>

                  {/* USAGE */}
                  <p className="text-center text-sm text-gray-600 mt-1">
                    ⏱ {item.usageHours} hrs / day
                  </p>

                  {/* CO₂ */}
                  <div className="mt-4 flex justify-center">
                    <span className="px-4 py-1 rounded-full bg-green-600 text-white font-bold shadow">
                      {item.co2Emission.toFixed(2)} kg CO₂
                    </span>
                  </div>

                  {/* DIVIDER */}
                  <div className="my-4 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent" />

                  {/* DATE */}
                  <p className="text-xs text-gray-400 text-center">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow">
          {history.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 border-b hover:bg-green-50"
            >
              <div className="flex items-center gap-4">
                <img src={getDeviceImage(item.deviceType)} className="h-12" alt="" />
                <div>
                  <p className="font-semibold capitalize">{item.deviceType}</p>
                  <p className="text-xs text-gray-500">{item.usageHours} hrs/day</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  {item.co2Emission.toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div className="max-w-6xl mx-auto overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3">Device</th>
                <th>Usage (hrs/day)</th>
                <th>CO₂ (kg)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item._id}
                  className="border-b text-center hover:bg-green-50"
                >
                  <td className="p-3 capitalize">{item.deviceType}</td>
                  <td>{item.usageHours}</td>
                  <td className="font-semibold text-green-700">
                    {item.co2Emission.toFixed(2)}
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= IMAGE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold text-green-700 mb-4 capitalize text-center">
              {selectedDevice} images
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {(deviceImageVariants[selectedDevice] ||
                deviceImageVariants.other).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="device"
                  className="h-32 w-full object-contain border rounded-lg"
                />
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Images are for reference only
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
