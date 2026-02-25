import React, { useState } from "react";
import axios from "axios";
import API_BASE from "../api/config";

export default function InputForm({ onResult }) {
  const [data, setData] = useState({
    deviceType: "",
    deviceName: "",
    powerRating: "",
    usageHours: "",
  });

  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deviceType" || name === "deviceName") {
      setData({ ...data, [name]: value });
      return;
    }

    if (value === "") {
      setData({ ...data, [name]: "" });
      return;
    }

    const num = Number(value);
    if (isNaN(num)) return;

    if (name === "powerRating" && (num < 1 || num > 10000)) return;
    if (name === "usageHours" && (num <= 0 || num > 24)) return;

    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo?.token) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!data.deviceType || !data.powerRating || !data.usageHours) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE}/api/footprint/calculate`,
        {
          deviceType: data.deviceType.trim(),
          deviceName: data.deviceName.trim() || "Not specified",
          powerRating: Number(data.powerRating),
          usageHours: Number(data.usageHours),
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      setData({
        deviceType: "",
        deviceName: "",
        powerRating: "",
        usageHours: "",
      });

      onResult?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to calculate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-6 bg-white/95 backdrop-blur
               border border-gray-200 shadow-xl rounded-2xl p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="border-b pb-4">
        <h2 className="text-4xl font-bold text-gray-800 ">
          Carbon Footprint Calculator
        </h2>

      </div>

      {/* DEVICE CATEGORY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Device Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="deviceType"
          value={data.deviceType}
          onChange={handleChange}
          placeholder="Laptop, AC, Server, Refrigerator"
          className="w-full rounded-md border border-gray-300 px-3 py-2
                   focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        />
      </div>

      {/* DEVICE NAME */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Device Name / Model
        </label>
        <input
          type="text"
          name="deviceName"
          value={data.deviceName}
          onChange={handleChange}
          placeholder="Dell Inspiron, LG DualCool"
          className="w-full rounded-md border border-gray-300 px-3 py-2
                   focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* POWER RATING */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Power Rating (Watts) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="powerRating"
          value={data.powerRating}
          onChange={handleChange}
          placeholder="e.g. 65"
          className="w-full rounded-md border border-gray-300 px-3 py-2
                   focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Laptop ~60W • AC ~1500W • Server ~500W
        </p>
      </div>

      {/* USAGE HOURS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usage Hours / Day <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="usageHours"
          value={data.usageHours}
          onChange={handleChange}
          placeholder="e.g. 8"
          step="0.1"
          className="w-full rounded-md border border-gray-300 px-3 py-2
                   focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        />
      </div>

      {/* SUBMIT */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold
                   bg-gradient-to-r from-green-600 to-teal-500
                   hover:from-green-700 hover:to-teal-600
                   transition-all disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Calculate Emissions"}
        </button>
      </div>
    </form>
  );
}
