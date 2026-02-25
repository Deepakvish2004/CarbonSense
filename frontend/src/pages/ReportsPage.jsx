import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DashboardHeader from "../components/DashboardHeader";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState("");
  const [ecoScore, setEcoScore] = useState(0);
  const [ecoLevel, setEcoLevel] = useState("");
  const [benchmark, setBenchmark] = useState([]);

  // ✅ Correct emission factors ONLY for computer devices
  const emissionFactors = {
    Laptop: 0.035, // kg CO₂/hour
    Desktop: 0.20,
    Monitor: 0.08,

    Laptop_Manufacturing: 300, // kg CO₂ total
    Desktop_Manufacturing: 600,
    Monitor_Manufacturing: 150,
  };

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (!stored) {
      alert("Please login to view reports.");
      navigate("/login", { replace: true });
      return;
    }

    const user = JSON.parse(stored);
    setUserInfo(user);
    fetchHistory(user);
  }, [navigate]);

  const fetchHistory = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(
        "http://localhost:5000/api/footprint/history",
        config
      );
      setHistory(res.data);
      generateInsights(res.data);
      generateBenchmark(res.data);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      alert("Failed to load report data.");
    }
  };

  // ✅ Smart Insight Generator
  const generateInsights = (data) => {
    if (!data || data.length === 0) return;

    const total = data.reduce((sum, item) => sum + (item.co2Emission || 0), 0);
    const topDevice = data.reduce((max, item) =>
      item.co2Emission > max.co2Emission ? item : max
    );

    const avgEmission = total / data.length;
    let message = "";
    let score = 0;
    let level = "";

    if (total < 10) {
      message = `🌱 Excellent! Your total CO₂ footprint (${total.toFixed(
        2
      )} kg) is very low. Keep it up!`;
      score = 90;
      level = "Eco Hero";
    } else if (total < 30) {
      message = `⚡ Good! You emit ${total.toFixed(
        2
      )} kg CO₂. Try optimizing ${topDevice.deviceType} usage.`;
      score = 65;
      level = "Average User";
    } else {
      message = `🔥 High CO₂ footprint (${total.toFixed(
        2
      )} kg) — mainly from ${topDevice.deviceType}. Try reducing runtime or usage.`;
      score = 35;
      level = "High Impact";
    }

    if (avgEmission > 5) {
      message += " 💡 Tip: Turn off idle devices.";
    }

    setInsight(message);
    setEcoScore(score);
    setEcoLevel(level);
  };

  // 🔧 Benchmark Computer Device Emissions
  const generateBenchmark = (data) => {
    const comparison = data.map((item) => {
      let avgEmission = 0.05; // fallback

      if (item.deviceType.toLowerCase().includes("laptop"))
        avgEmission = emissionFactors.Laptop;

      else if (item.deviceType.toLowerCase().includes("desktop"))
        avgEmission = emissionFactors.Desktop;

      else if (item.deviceType.toLowerCase().includes("monitor"))
        avgEmission = emissionFactors.Monitor;

      const status =
        item.co2Emission < avgEmission
          ? "✅ Below Average"
          : item.co2Emission <= avgEmission * 1.5
          ? "⚠️ Slightly Above"
          : "🔥 Much Above";

      return {
        device: item.deviceType,
        emission: item.co2Emission.toFixed(2),
        average: avgEmission.toFixed(3),
        status,
      };
    });

    setBenchmark(comparison);
  };

  const barData = history.map((item) => ({
    device: item.deviceType,
    emission: item.co2Emission,
  }));

  // 📄 Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("💻 Computer Carbon Footprint Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${userInfo.name}`, 14, 30);
    doc.text(`Email: ${userInfo.email}`, 14, 38);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 46);

    const tableColumn = [
      "Device Type",
      "Power (W)",
      "Usage (hr)",
      "CO₂ (kg)",
      "Date",
    ];

    const tableRows = [];

    history.forEach((item) => {
      const date = item.date || item.createdAt || item.updatedAt;
      tableRows.push([
        item.deviceType,
        item.powerRating,
        item.usageHours,
        item.co2Emission?.toFixed(2),
        date ? new Date(date).toLocaleDateString() : "—",
      ]);
    });

    doc.autoTable({
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    });

    const total = history
      .reduce((sum, i) => sum + (i.co2Emission || 0), 0)
      .toFixed(2);

    doc.text(
      `🌍 Total CO₂ Emission: ${total} kg`,
      14,
      doc.autoTable.previous.finalY + 10
    );

    doc.save(`Carbon_Report_${userInfo.name}.pdf`);
  };

  const generateCSV = () => {
    const headers = [
      "Device Type,Power (W),Usage (hr),CO₂ (kg),Date",
    ];

    const rows = history.map((item) => {
      const date = item.date || item.createdAt || item.updatedAt;
      return [
        item.deviceType,
        item.powerRating,
        item.usageHours,
        item.co2Emission?.toFixed(2),
        date ? new Date(date).toLocaleDateString() : "—",
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Carbon_Report_${userInfo.name}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProgressColor = () => {
    if (ecoScore >= 80) return "bg-green-500";
    if (ecoScore >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  const totalCO2 = history
    .reduce((sum, item) => sum + (item.co2Emission || 0), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-500 to-green-300 p-6">
      {userInfo && <DashboardHeader userInfo={userInfo} />}

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          📊 Computer Carbon Footprint Reports & Insights
        </h2>

        {/* Smart Insight */}
        {insight && (
          <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-green-700 mb-2">
              💡 Smart Insight
            </h3>
            <p>{insight}</p>
          </div>
        )}

        {/* Eco Score */}
        {ecoScore > 0 && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-green-700">
                🌿 Eco Score: {ecoLevel}
              </span>
              <span className="font-semibold text-gray-700">
                {ecoScore}%
              </span>
            </div>

            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-4 ${getProgressColor()} transition-all duration-700`}
                style={{ width: `${ecoScore}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-600 mt-1 text-right italic">
              Higher score = more eco-friendly 🌎
            </p>
          </div>
        )}

        {/* Comparison */}
        {benchmark.length > 0 && (
          <div className="bg-white border border-green-200 rounded-lg p-5 mb-10 shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-4 text-center">
              📈 Device Benchmark (Compared to Typical Computer CO₂)
            </h3>

            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="p-2 border border-gray-300">Device</th>
                  <th className="p-2 border border-gray-300">Your CO₂ (kg)</th>
                  <th className="p-2 border border-gray-300">Avg CO₂ (kg)</th>
                  <th className="p-2 border border-gray-300">Status</th>
                </tr>
              </thead>

              <tbody>
                {benchmark.slice(0, 5).map((b, index) => (
                  <tr key={index} className="text-center hover:bg-green-50">
                    <td className="p-2 border border-gray-300">{b.device}</td>
                    <td className="p-2 border border-gray-300">{b.emission}</td>
                    <td className="p-2 border border-gray-300">{b.average}</td>
                    <td className="p-2 border border-gray-300">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bar Chart */}
        {history.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg shadow mb-10">
            <h3 className="text-lg font-semibold text-green-700 mb-4 text-center">
              Device-wise CO₂ Emission (kg)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg`} />
                <Bar dataKey="emission" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary + Export */}
        <div className="flex justify-between flex-wrap gap-3 mt-6">
          <p className="text-lg font-semibold text-green-700">
            🌍 Total Emission: {totalCO2} kg
          </p>

          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              ⬇ Download PDF
            </button>

            <button
              onClick={generateCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🧾 Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
