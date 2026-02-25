import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function UserInbox() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!userInfo?.token) {
      navigate("/login");
      return;
    }
    fetchAlerts();
    // eslint-disable-next-line
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/alerts",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      setAlerts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (alertId, response) => {
    try {
      setRespondingId(alertId);

      await axios.post(
        "http://localhost:5000/api/users/alerts/respond",
        { alertId, response },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      await fetchAlerts();
    } catch (err) {
      console.error("❌ Failed to respond", err);
    } finally {
      setRespondingId(null);
    }
  };

  const responseBadge = (response) => {
    if (response === "Active") {
      return "text-green-700 font-semibold";
    }
    if (response === "Inactive") {
      return "text-blue-700 font-semibold";
    }
    return "text-gray-600";
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          📥 My Alerts
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center">
            Loading alerts...
          </p>
        ) : alerts.length === 0 ? (
          <p className="text-gray-500 text-center">
            No alerts.
          </p>
        ) : (
          alerts.map((a) => (
            <div
              key={a._id}
              className="border p-4 rounded mb-3 bg-gray-50"
            >
              <p className="mb-2 text-gray-800">
                {a.message}
              </p>

              {/* PENDING STATE */}
              {a.status === "Pending" ? (
                <div className="flex gap-3">
                  <button
                    disabled={respondingId === a._id}
                    onClick={() =>
                      respond(a._id, "Active")
                    }
                    className="bg-green-600 disabled:opacity-50 text-white px-4 py-1 rounded"
                  >
                    I’m Active
                  </button>

                  <button
                    disabled={respondingId === a._id}
                    onClick={() =>
                      respond(a._id, "Inactive")
                    }
                    className="bg-gray-600 disabled:opacity-50 text-white px-4 py-1 rounded"
                  >
                    I’m Inactive
                  </button>
                </div>
              ) : a.userResponse === "Inactive" ? (
                /* INACTIVE → SHOW ACTIVATE BUTTON */
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-semibold text-sm">
                    ℹ You marked yourself as <b>Inactive</b>
                  </span>

                  <button
                    disabled={respondingId === a._id}
                    onClick={() =>
                      respond(a._id, "Active")
                    }
                    className="bg-green-600 disabled:opacity-50 text-white px-4 py-1 rounded"
                  >
                    Activate Account
                  </button>
                </div>
              ) : (
                /* ACTIVE CONFIRMATION */
                <span
                  className={`text-sm ${responseBadge(
                    a.userResponse
                  )}`}
                >
                  ✔ You marked yourself as{" "}
                  <b>{a.userResponse}</b>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
