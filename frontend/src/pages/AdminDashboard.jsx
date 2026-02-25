import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [footprints, setFootprints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDevice, setFilterDevice] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();


  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    if (!adminInfo?.token) {
      alert("Access denied. Admins only.");
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      const [userRes, footRes, logRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", config),
        axios.get("http://localhost:5000/api/admin/footprints", config),
        axios.get("http://localhost:5000/api/admin/activity", config),
      ]);
      setUsers(userRes.data);
      setFootprints(footRes.data);
      setActivities(logRes.data);
      setMessage("✅ Data loaded successfully.");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("❌ Fetch error:", err.response?.data || err.message);
      setMessage("❌ Failed to load admin data.");
    }
  };

  const logActivity = async (action, target) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await axios.post("http://localhost:5000/api/admin/activity/log", { action, target }, config);
    } catch (err) {
      console.error("⚠ Failed to log activity:", err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      await logActivity("Deleted User", `User: ${name}`);
      setMessage(`✅ User "${name}" deleted successfully.`);
      fetchData();
    } catch (err) {
      console.error("❌ Delete user error:", err.response?.data || err.message);
      setMessage("❌ Failed to delete user.");
    }
  };

  const handleDeleteRecord = async (id, device) => {
    if (!window.confirm(`Delete record for "${device}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/footprints/${id}`, config);
      await logActivity("Deleted Record", `Device: ${device}`);
      setMessage(`✅ Record for "${device}" deleted.`);
      fetchData();
    } catch (err) {
      console.error("❌ Delete record error:", err.response?.data || err.message);
      setMessage("❌ Failed to delete record.");
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Clear all activity logs?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await axios.delete("http://localhost:5000/api/admin/activity/clear", config);
      setMessage("🗑 All logs cleared.");
      fetchData();
    } catch (err) {
      console.error("❌ Clear logs error:", err.response?.data || err.message);
    }
  };

  const totalCO2 = useMemo(
    () => footprints.reduce((sum, f) => sum + (f.co2Emission || 0), 0).toFixed(2),
    [footprints]
  );
  const avgCO2 = useMemo(
    () => (users.length ? (totalCO2 / users.length).toFixed(2) : 0),
    [users, totalCO2]
  );
  const mostUsedDevice = useMemo(() => {
    const freq = {};
    footprints.forEach((f) => {
      freq[f.deviceType] = (freq[f.deviceType] || 0) + 1;
    });
    return Object.keys(freq).length
      ? Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";
  }, [footprints]);

const filteredFootprints = useMemo(() => {
  let data = [...footprints];

  // ✅ FILTER BY SELECTED USER (IMPORTANT)
  if (selectedUser) {
    data = data.filter(
      (f) => String(f.user?._id) === String(selectedUser._id)
    );
  }

  // 🔍 SEARCH BY DEVICE
  if (searchTerm) {
    data = data.filter((f) =>
      f.deviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 🎯 FILTER BY DEVICE DROPDOWN
  if (filterDevice) {
    data = data.filter((f) => f.deviceType === filterDevice);
  }

  // 🔃 SORT BY CO₂
  data.sort((a, b) =>
    sortOrder === "asc"
      ? a.co2Emission - b.co2Emission
      : b.co2Emission - a.co2Emission
  );

  return data;
}, [footprints, selectedUser, searchTerm, filterDevice, sortOrder]);


  const deviceOptions = [...new Set(footprints.map((f) => f.deviceType))];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-green-100">
      <AdminNavbar />

      <div className="flex-1 ml-0 md:ml-64 p-6 space-y-8">
        {/* Header */}
        <div className="bg-green-700 text-white p-5 rounded-xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">👨‍💼 Admin Dashboard</h1>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Exit
          </button>

          
        </div>

        {/* Message */}
        {message && (
          <div
            className={`text-center py-3 rounded-md font-medium ${
              message.includes("✅")
                ? "bg-green-100 text-green-800 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "👥 Users", value: users.length, color: "bg-green-100 text-green-800" },
            { label: "🌍 CO₂ Total (kg)", value: totalCO2, color: "bg-blue-100 text-blue-800" },
            { label: "⚖ Avg per User", value: avgCO2, color: "bg-yellow-100 text-yellow-800" },
            { label: "💻 Common Device", value: mostUsedDevice, color: "bg-rose-100 text-rose-800" },
          ].map((card, i) => (
            <div
              key={i}
              className={`${card.color} p-5 rounded-xl shadow text-center hover:scale-105 transition`}
            >
              <h3 className="text-lg font-semibold">{card.label}</h3>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="🔍 Search device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm w-full md:w-60 focus:ring-2 focus:ring-green-400"
          />
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
          >
            <option value="">All Devices</option>
            {deviceOptions.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
          >
            <option value="desc">Sort: High → Low</option>
            <option value="asc">Sort: Low → High</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold text-green-700 mb-4">👥 All Registered Users</h2>
          {users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="text-center border-b hover:bg-green-50 transition"
                  >
                    <td
  className="p-2 text-green-700 font-medium cursor-pointer hover:underline"
  onClick={() => setSelectedUser(u)}
>
  {u.name}
</td>

                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.isAdmin ? "✅" : "❌"}</td>
                    <td className="p-2">
                      {!u.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

       {/* CO₂ Records */}
<div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
  <h2 className="text-xl font-semibold text-green-700 mb-4">
    🌿 All CO₂ Records
  </h2>

  {/* ✅ Selected User Indicator */}
  {selectedUser && (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
        Viewing records for: <b>{selectedUser.name}</b>
      </span>
      <button
        onClick={() => setSelectedUser(null)}
        className="text-sm text-red-600 hover:underline"
      >
        Clear Filter
      </button>
    </div>
  )}

  {filteredFootprints.length === 0 ? (
    <p className="text-center text-gray-500 py-6">
      No CO₂ records found.
    </p>
  ) : (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-green-700 text-white">
        <tr>
          <th className="p-3 text-left">User</th>
          <th className="p-3 text-left">Device</th>
          <th className="p-3">Power (W)</th>
          <th className="p-3">Usage (hr)</th>
          <th className="p-3">CO₂ (kg)</th>
          <th className="p-3">Created</th>
          <th className="p-3">Updated</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredFootprints.map((f) => (
          <tr
            key={f._id}
            className="border-b hover:bg-green-50 transition"
          >
            <td className="p-2 font-medium text-green-700">
              {f.user?.name || "—"}
            </td>
            <td className="p-2 capitalize">{f.deviceType}</td>
            <td className="p-2 text-center">{f.powerRating}</td>
            <td className="p-2 text-center">{f.usageHours}</td>
            <td className="p-2 text-center">
              {f.co2Emission?.toFixed(2) || "0.00"}
            </td>
            <td className="p-2 text-center">
              {f.createdAt
                ? new Date(f.createdAt).toLocaleDateString()
                : "—"}
            </td>
            <td className="p-2 text-center">
              {f.updatedAt
                ? new Date(f.updatedAt).toLocaleDateString()
                : "—"}
            </td>
            <td className="p-2 text-center">
              <button
                onClick={() => handleDeleteRecord(f._id, f.deviceType)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


        {/* Activity Log */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">🧾 Admin Activity Logs</h2>
            <button
              onClick={handleClearLogs}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Clear Logs
            </button>
          </div>

          {activities.length === 0 ? (
            <p className="text-center text-gray-500">No logs available.</p>
          ) : (
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr
                    key={a._id}
                    className="text-center border-b hover:bg-green-50 transition"
                  >
                    <td className="p-2">{a.admin?.name || "—"}</td>
                    <td className="p-2">{a.action}</td>
                    <td className="p-2">{a.target}</td>
                    <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
