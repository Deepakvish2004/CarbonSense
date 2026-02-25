import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

export default function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    if (!adminInfo?.token) {
      alert("Access denied");
      navigate("/admin/login");
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users/activity",
        {
          headers: { Authorization: `Bearer ${adminInfo.token}` },
        }
      );
      setUsers(res.data);
    } catch {
      setMessage("❌ Failed to load users");
    }
  };

  const inactiveDays = (lastLogin) => {
    if (!lastLogin) return "Never";
    const diff = Date.now() - new Date(lastLogin).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const sendReminder = async (userId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/admin/send-reminder",
        { userId },
        {
          headers: { Authorization: `Bearer ${adminInfo.token}` },
        }
      );

      setMessage("🟣 Reminder sent");
      fetchUsers(); // 🔥 refresh UI
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to send reminder");
    }
  };

  /* --------------------------------
     STATUS BADGE COLOR
  -------------------------------- */
  const statusBadge = (u) => {
    if (u.activityStatus === "Inactive") {
      return "bg-blue-100 text-blue-700";
    }

    if (u.pendingAlert && u.pendingAlert.reminderCount > 0) {
      return "text-purple-700 font-semibold";
    }

    return "bg-green-100 text-green-800 font-bold";
  };

  /* --------------------------------
     STATUS TEXT
  -------------------------------- */
  const statusText = (u) => {
    if (u.activityStatus === "Inactive") return "Inactive";

    if (u.pendingAlert?.autoEmailSent)
      return "Email Sent";

    if (u.pendingAlert)
      return `Reminder Sent (${u.pendingAlert.reminderCount})`;

    return "Active";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="flex-1 p-6 ml-0 md:ml-64">
        <h1 className="text-2xl font-bold text-green-700 mb-6">
          🛠 Admin Management
        </h1>

        {message && (
          <div className="mb-4 text-center bg-green-100 text-green-800 p-2 rounded">
            {message}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Last Login</th>
                <th className="p-3">Inactive Days</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="text-center border-b hover:bg-green-50"
                >
                  <td className="p-2 font-medium">{u.name}</td>
                  <td className="p-2">{u.email}</td>

                  <td className="p-2">
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>

                  <td className="p-2">
                    {inactiveDays(u.lastLogin)}
                  </td>

                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${statusBadge(
                        u
                      )}`}
                    >
                      {statusText(u)}
                    </span>
                  </td>

                  <td className="p-2">
                    {u.activityStatus === "Inactive" ? (
                      <span className="text-gray-400">No Action</span>
                    ) : u.pendingAlert?.autoEmailSent ? (
                      <span className="text-red-600 font-semibold">
                        Email Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => sendReminder(u._id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No users found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
