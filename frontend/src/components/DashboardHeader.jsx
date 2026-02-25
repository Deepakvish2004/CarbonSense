import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ userInfo }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    alert("You have been logged out.");
    navigate("/");
  };

  const ecoSuggestions = [
    "💡 Reduce screen brightness to save energy and lower CO₂.",
    "🔋 Avoid frequent charging – charge up to 80% for better battery and lower emissions.",
    "🌱 Closing unused apps reduces CPU load → less energy → less CO₂.",
    "🌿 Recycling one laptop saves up to 300 kg CO₂ of manufacturing impact.",
    "🖥 Put device into sleep mode when idle – reduces energy use by 80%.",
    "🚫 Don’t keep your charger plugged in all day – it wastes electricity.",
    "🕒 Reduce hours of heavy CPU tasks to lower energy use."
  ];

  const showEcoTip = () => {
    const randomTip =
      ecoSuggestions[Math.floor(Math.random() * ecoSuggestions.length)];
    alert(`🌎 Eco Suggestion\n\n${randomTip}`);
  };

  return (
    <>
      <header className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow-md rounded-lg">

        {/* TITLE */}
        <h1
          onClick={() => navigate("/dashboard")}
          className="text-xl font-bold cursor-pointer hover:text-green-300 transition"
        >
          🌿 Carbon Analyzer Dashboard
        </h1>

        {/* ACTIONS */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/user/inbox")}
            className="hover:text-green-200 transition font-semibold"
          >
            📥 Inbox
          </button>

          <button
            onClick={() => setShowProfile(true)}
            className="hover:text-green-200 transition"
          >
            My Profile
          </button>

          <button
            onClick={showEcoTip}
            className="hover:text-green-200 transition"
          >
            Eco Tips
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="hover:text-green-200 transition"
          >
            Reports
          </button>

          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-80 p-6 rounded-xl shadow-2xl text-green-800">
            <h2 className="text-xl font-bold mb-4 text-center">
              👤 Profile Details
            </h2>

            <div className="space-y-2">
              <p><strong>Name:</strong> {userInfo?.name}</p>
              <p><strong>Email:</strong> {userInfo?.email}</p>
              <p><strong>Role:</strong> User</p>
            </div>

            <button
              onClick={() => setShowProfile(false)}
              className="mt-6 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
