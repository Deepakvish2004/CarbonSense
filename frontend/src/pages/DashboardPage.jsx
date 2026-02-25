import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputForm from "../components/InputForm";

import { motion } from "framer-motion";
import axios from "axios";
import API_BASE from "../api/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [alertConfig, setAlertConfig] = useState(null);


  // -------------------------------
  // CHECK LOGIN
  // -------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (!stored) {
      alert("Please login to access your dashboard.");
      navigate("/login", { replace: true });
      return;
    }

    const user = JSON.parse(stored);
    setUserInfo(user);
    fetchHistory(user);
    fetchAlertConfig();
  }, [navigate]);

  // -------------------------------
  // FETCH HISTORY
  // -------------------------------


  const fetchHistory = async (user) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(
        `${API_BASE}/api/footprint/history`,
        config
      );

      setHistory(res.data || []); // ✅ THIS WAS MISSING
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/alert/settings`);
      setAlertConfig(res.data);
    } catch (err) {
      console.error("Failed to fetch alert settings", err);
    }
  };



  // -------------------------------
  // AUTO CHECK & SEND EMAIL ALERT (10 KG)
  // -------------------------------
  useEffect(() => {
    if (!userInfo) return;

    async function checkEmailAlert() {
      try {
        const res = await axios.post(`${API_BASE}/api/alert/check-total`, {
          userId: userInfo._id,
          userEmail: userInfo.email,
        });

        console.log("Alert Check:", res.data);

        if (res.data.alertSent) {
          alert("⚠ Your total CO₂ emission has crossed 10 KG. An alert email has been sent!");
        }
      } catch (error) {
        console.error("Email alert error:", error);
      }
    }

    checkEmailAlert();
  }, [userInfo]);

  // -------------------------------
  // HANDLE SUBMIT
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${API_BASE}/api/footprint/calculate`,
        form,
        config
      );

      alert("✅ Calculation saved successfully!");
      setForm({ deviceType: "", powerRating: "", usageHours: "" });
      fetchHistory(userInfo);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error saving data.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // DELETE RECORD
  // -------------------------------
  const handleDelete = async (id, device) => {
    if (!window.confirm(`Delete record for "${device}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_BASE}/api/footprint/${id}`, config);

      setMessage(`🗑️ "${device}" deleted successfully.`);
      fetchHistory(userInfo);

      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      alert("Failed to delete record.");
    }
  };


  // -------------------------------
  // SUMMARIES
  // -------------------------------
  const totalCO2 = history.length
    ? history.reduce((sum, i) => sum + (i.co2Emission || 0), 0).toFixed(2)
    : "0.00";

  // PIE DATA
  const recentHistory = history.slice(0, 10);

  const pieData = Object.values(
    recentHistory.reduce((acc, curr) => {

      const type = curr.deviceType || "Unknown";
      if (!acc[type]) acc[type] = { name: type, value: 0 };
      acc[type].value += curr.co2Emission;
      return acc;
    }, {})
  );

  const COLORS = [
    "#16a34a", "#22c55e", "#15803d",
    "#86efac", "#4ade80", "#166534", "#65a30d",
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };


  const getRiskMessage = () => {
    if (!alertConfig) return "Loading risk status...";

    const { alert10, alert15 } = alertConfig;
    const total = Number(totalCO2);

    if (total < alert10) {
      return `✅ Great job! Your carbon impact is below ${alert10} kg.`;
    }

    if (total >= alert10 && total < alert15) {
      return `⚠️ Warning! You crossed ${alert10} kg emission limit.`;
    }

    return `🚨 Critical! You crossed ${alert15} kg emission limit.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-6 relative overflow-hidden">

      {/* HEADER */}
      {userInfo && <DashboardHeader userInfo={userInfo} />}

      {/* MESSAGE */}
      {message && (
        <motion.div
          className="text-center bg--100 text-green-700 border border-green-400 py-2 rounded-md mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {message}
        </motion.div>
      )}

      {/* SUMMARY */}
      {userInfo && (
        <motion.div
          className="mt-6 max-w-3xl mx-auto bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row justify-between items-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <h2 className="text-2xl font-semibold">Hello, {userInfo.name} 👋</h2>
            <p className="text-sm opacity-90">Email: {userInfo.email}</p>
          </div>

          <div className="mt-4 md:mt-0 text-center">
            <h3 className="text-lg font-semibold">🌍 Total CO₂ Emission</h3>
            <p className="text-3xl font-bold mt-1">{totalCO2} kg</p>
            <p className="text-sm opacity-80 mt-1">
              {getRiskMessage()}
            </p>

          </div>
        </motion.div>
      )}
      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-10 max-w-3xl mx-auto"
      >
        <InputForm
          userInfo={userInfo}
          onResult={() => fetchHistory(userInfo)}
        />
      </motion.div>



      {/* CHARTS */}
      <motion.div
        className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* BAR CHART */}
        <motion.div
          className="bg-white/90 p-6 rounded-2xl shadow-xl"
          variants={cardVariants}
        >
          <h2 className="text-lg font-semibold text-green-700 mb-4 text-center">
            📈 CO₂ Emission History
          </h2>

          {history.length === 0 ? (
            <p className="text-center text-gray-500">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentHistory}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="deviceType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="co2Emission" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* PIE CHART */}
        <motion.div
          className="bg-white/90 p-6 rounded-2xl shadow-xl"
          variants={cardVariants}
        >
          <h2 className="text-lg font-semibold text-green-700 mb-4 text-center">
            🥧 Category-wise CO₂ Contribution
          </h2>

          {pieData.length === 0 ? (
            <p className="text-center text-gray-500">No categories yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={50}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>

      {/* FOOTER ACTIONS */}
      <motion.footer
        className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 max-w-6xl mx-auto mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            🗑️ Manage Your CO₂ Records
          </h2>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/prediction")}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
            >
              Predict CO₂
            </button>






            <button
              onClick={() => navigate("/location-insights")}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
            >
              Location Insights
            </button>
            <button
              onClick={() => navigate("/wastepage")}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
            >
              Waste
            </button>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Delete ALL records?")) {
                    history.forEach((item) =>
                      handleDelete(item._id, item.deviceType)
                    );
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>




        <div className="divide-y divide-gray-300">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-3">No records yet.</p>
          ) : (
            recentHistory.map((item) => (

              <div
                key={item._id}
                className="flex justify-between items-center py-3"
              >
                <div>
                  <strong className="text-green-700">{item.deviceType}</strong>{" "}
                  <span className="text-gray-600">
                    – {item.usageHours} hrs/day
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-green-700">
                    {item.co2Emission.toFixed(2)} kg CO₂
                  </span>

                  <button
                    onClick={() => handleDelete(item._id, item.deviceType)}
                    className="text-red-500 font-semibold hover:text-red-700"
                  >
                    Delete
                  </button>



                </div>
              </div>
            ))
          )}
          {history.length > 10 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/history")}
                className="bg-gradient-to-r from-green-500 to-teal-500
                   text-white px-6 py-2 rounded-lg shadow-lg
                   hover:scale-105 transition"
              >
                View All History
              </button>
            </div>
          )}


        </div>
      </motion.footer>
    </div>
  );
}
