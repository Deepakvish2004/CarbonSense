import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SemiGauge from "../components/SemiGauge";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PredictionPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [predicted, setPredicted] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [filterType, setFilterType] = useState("all");
  const [aiTips, setAiTips] = useState([]);
  const [ecoScore, setEcoScore] = useState(0);
  const [scenario, setScenario] = useState("none");

  const [prediction, setPrediction] = useState(null); // NEW
  

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    if (!userInfo?.token) {
      alert("Please login to access predictions.");
      navigate("/login");
      return;
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get("http://localhost:5000/api/footprint/history", config);
      const data = res.data || [];

      const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setHistory(sorted);
      generatePrediction(sorted);
      generateAITips(sorted);
      calculateEcoScore(sorted);
      fetchPredictionData(); // NEW
    } catch (err) {
      console.error("❌ Failed to fetch history:", err);
      alert("Failed to load prediction data.");
    } finally {
      setLoading(false);
    }
  };

  // NEW — CALL BACKEND PREDICTION
  const fetchPredictionData = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/predict/predict", {
        userId: userInfo._id,
      });

      setPrediction(res.data);
    } catch (err) {
      console.error("❌ Backend Prediction Error:", err);
    }
  };

  const generatePrediction = (data) => {
    if (data.length < 2) {
      setPredicted(null);
      setSuggestion("Add more data to generate accurate predictions.");
      return;
    }

    const emissions = data.map((d) => d.co2Emission);
    const diffs = emissions.slice(1).map((v, i) => v - emissions[i]);
    const avgGrowth = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const lastValue = emissions[emissions.length - 1];
    const nextValue = (lastValue + avgGrowth).toFixed(2);

    setPredicted(nextValue);

    if (avgGrowth > 2) {
      setSuggestion("⚠️ Your CO₂ footprint is increasing. Consider reducing daily usage or switching to energy-efficient devices.");
    } else if (avgGrowth < -1) {
      setSuggestion("✅ Great job! Your CO₂ impact is reducing — keep it up!");
    } else {
      setSuggestion("🙂 Stable usage. Try optimizing further for a greener impact.");
    }
  };

  const generateAITips = (data) => {
    if (data.length === 0) return;

    const highestDevice = data.reduce(
      (max, item) => (item.co2Emission > max.co2Emission ? item : max),
      data[0]
    );

    const avgEmission = data.reduce((sum, item) => sum + item.co2Emission, 0) / data.length;

    const tips = [
      {
        title: "💡 Top Emission Source",
        message: `Your ${highestDevice.deviceType} contributes the most (${highestDevice.co2Emission.toFixed(
          2
        )} kg CO₂). Try reducing its usage or enable power-saving mode.`,
        type: "alert",
      },
      {
        title: "🌿 Daily Optimization",
        message: "Unplug unused devices and shut down computers overnight. Saves up to 10% energy per week.",
        type: "info",
      },
      {
        title: "⚙️ Smart Power Settings",
        message: "Set screens to turn off after 5 minutes of inactivity. Small habits make a big impact.",
        type: "suggestion",
      },
    ];

    if (avgEmission > 50) {
      tips.push({
        title: "🔥 High Emission Alert",
        message: "Your average CO₂ per record exceeds 50 kg. Consider upgrading to eco-certified appliances.",
        type: "warning",
      });
    }

    setAiTips(tips);
  };

  const calculateEcoScore = (data, adjustment = 1) => {
    if (data.length === 0) return setEcoScore(0);
    const avgEmission = data.reduce((sum, i) => sum + i.co2Emission, 0) / data.length;
    let score = 100 - avgEmission * adjustment;
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    setEcoScore(score.toFixed(0));
  };

  const getScenarioFactor = () => {
    switch (scenario) {
      case "reduce1hr":
        return 0.85;
      case "ecoMode":
        return 0.75;
      case "upgrade":
        return 0.6;
      default:
        return 1;
    }
  };

  const adjustedPrediction = predicted
    ? (predicted * getScenarioFactor()).toFixed(2)
    : null;

  useEffect(() => {
    if (history.length > 0) calculateEcoScore(history, getScenarioFactor());
  }, [scenario]);

  const filteredData = history
    .filter((i) => (filterType === "all" ? true : i.deviceType === filterType))
    .map((i) => ({
      name: new Date(i.createdAt).toLocaleDateString(),
      co2: i.co2Emission,
    }));

  const chartData = [
    ...filteredData,
    ...(predicted ? [{ name: "Predicted", co2: Number(predicted) }] : []),
    ...(adjustedPrediction
      ? [{ name: "Scenario", co2: Number(adjustedPrediction) }]
      : []),
  ];

  const deviceTypes = [...new Set(history.map((i) => i.deviceType))];
  const isDark = theme === "dark";
  const bgColor = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gradient-to-b from-green-50 to-green-100";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textPrimary = isDark ? "text-green-300" : "text-green-700";
  const scoreColor =
    ecoScore >= 80
      ? "bg-green-500"
      : ecoScore >= 50
      ? "bg-yellow-400"
      : "bg-red-500";
  const scoreLabel =
    ecoScore >= 80
      ? "🌱 Excellent"
      : ecoScore >= 50
      ? "⚠️ Moderate"
      : "🔥 High Impact";

  return (
    <div className={`min-h-screen ${bgColor} p-6 transition-all duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
        <h1 className={`text-2xl font-bold ${textPrimary}`}>
          CO₂ Emission Prediction
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`border rounded-md px-3 py-1 text-sm ${
              isDark
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            <option value="all">All Devices</option>
            {deviceTypes.map((t, i) => (
              <option key={i}>{t}</option>
            ))}
          </select>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-md text-sm shadow ${
              isDark
                ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Prediction Card (UPDATED) */}
      <div className={`${cardBg} p-6 rounded-lg shadow-md text-center mb-8 max-w-3xl mx-auto`}>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-2`}>
          Emission Prediction
        </h2>

        <p className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
          Tomorrow: {prediction?.tomorrow ? prediction.tomorrow.toFixed(2) : "--"} kg CO₂
        </p>

        <p className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-600"} mt-2`}>
          Next 7 Days: {prediction?.next7days ? prediction.next7days.toFixed(2) : "--"} kg CO₂
        </p>

        <p className={`text-3xl font-bold mt-3 ${isDark ? "text-green-400" : "text-green-600"}`}>
          Current Trend: {adjustedPrediction
            ? `${adjustedPrediction} kg CO₂`
            : predicted
            ? `${predicted} kg CO₂`
            : "—"}
        </p>

        <p className="text-sm mt-2 text-gray-500 dark:text-gray-300">
          {suggestion}
        </p>
      </div>

      {/* Eco Score */}
      <div className={`${cardBg} max-w-3xl mx-auto p-6 rounded-lg shadow-md mb-10`}>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-3`}>
          Your Eco-Score
        </h2>
        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreColor} transition-all duration-700`}
            style={{ width: `${ecoScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="font-medium">{scoreLabel}</span>
          <span className="font-semibold">{ecoScore}/100</span>
        </div>
      </div>

      {/* Chart */}
      <div className={`${cardBg} rounded-lg shadow-md p-6 max-w-5xl mx-auto`}>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-4 text-center`}>
          Emission Trend (with Prediction)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ccc"} />
            <XAxis dataKey="name" stroke={isDark ? "#ddd" : "#333"} />
            <YAxis stroke={isDark ? "#ddd" : "#333"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#222" : "#fff",
                borderRadius: "10px",
                border: `1px solid ${isDark ? "#555" : "#ddd"}`,
              }}
              formatter={(v) => [`${v.toFixed(2)} kg CO₂`, "Emission"]}
            />
            <Legend />
            <Line type="monotone" dataKey="co2" stroke={isDark ? "#4ade80" : "#16a34a"} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Tips */}
      <div className={`${cardBg} max-w-5xl mx-auto mt-8 p-6 rounded-lg shadow-md`}>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>
          AI Insights & CO₂ Reduction Tips
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {aiTips.map((tip, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                tip.type === "warning"
                  ? "border-red-400 bg-red-50"
                  : tip.type === "alert"
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-green-300 bg-green-50"
              }`}
            >
              <h3 className="font-semibold mb-1 text-gray-800">{tip.title}</h3>
              <p className="text-sm text-gray-600">{tip.message}</p>
            </div>
          ))}
        </div>
      </div>
      {/* ⭐ Semi-Circle Risk Gauge */}
<div className={`${cardBg} max-w-3xl mx-auto p-6 m-10 rounded-lg  shadow-md mb-10`}>
  <h2 className={`text-lg font-semibold ${textPrimary} mb-3`}>
    Emission Risk Meter
  </h2>

  <SemiGauge value={prediction?.totalOverall || 0} />

  <p className="text-sm text-center text-gray-500 mt-2">
    Based on your lifetime total emissions.
  </p>
</div>


      {/* Back Button */}
      <div className="text-center mt-10">
        <button
          onClick={() => navigate(-1)}
          className={`px-6 py-2 rounded-lg shadow font-medium transition ${
            isDark
              ? "bg-green-500 hover:bg-green-400 text-gray-900"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
