import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
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
  const [form, setForm] = useState({
    deviceType: "",
    powerRating: "",
    usageHours: "",
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
  }, [navigate]);

  // -------------------------------
  // FETCH HISTORY
  // -------------------------------
  const fetchHistory = async (user) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(
        "http://localhost:5000/api/footprint/history",
        config
      );
      setHistory(res.data || []);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // AUTO CHECK & SEND EMAIL ALERT (10 KG)
  // -------------------------------
  useEffect(() => {
    if (!userInfo) return;

    async function checkEmailAlert() {
      try {
        const res = await axios.post("http://localhost:5000/api/alert/check-total", {
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
        "http://localhost:5000/api/footprint/calculate",
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
      await axios.delete(`http://localhost:5000/api/footprint/${id}`, config);

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
  const pieData = Object.values(
    history.reduce((acc, curr) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-6 relative overflow-hidden">

      {/* HEADER */}
      {userInfo && <DashboardHeader userInfo={userInfo} />}

      {/* MESSAGE */}
      {message && (
        <motion.div
          className="text-center bg-green-100 text-green-700 border border-green-400 py-2 rounded-md mb-3"
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
              {totalCO2 < 10
                ? "✅ Great job! Your carbon impact is low."
                : "⚠️ You crossed the 10 KG limit."}
            </p>
          </div>
        </motion.div>
      )}

      {/* FORM */}
      <motion.div
        className="mt-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-lg mx-auto"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-lg font-semibold mb-3 text-green-700">
          Add New Calculation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="deviceType"
            placeholder="Device Type (Laptop,etc.)"
            value={form.deviceType}
            onChange={(e) =>
              setForm({ ...form, deviceType: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="number"
            name="powerRating"
            placeholder="Power Rating (W)"
            value={form.powerRating}
            onChange={(e) =>
              setForm({ ...form, powerRating: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="number"
            name="usageHours"
            placeholder="Usage Hours per Day"
            value={form.usageHours}
            onChange={(e) =>
              setForm({ ...form, usageHours: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg"
          >
            {loading ? "Saving..." : "Calculate"}
          </button>
        </form>
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
              <BarChart data={history}>
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
            history.map((item) => (
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
        </div>
      </motion.footer>
    </div>
  );
}
