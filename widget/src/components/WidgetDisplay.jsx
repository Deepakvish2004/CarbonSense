// widget/renderer/components/WidgetDisplay.jsx
import React, { useEffect, useState } from "react";
import { sendEmissionData } from "../utils/syncService";

export default function WidgetDisplay() {
  const [stats, setStats] = useState({
    cpuLoad: 0,
    batteryPercent: 0,
    isCharging: false,
    powerUsage: 0,
    co2Emission: 0,
  });

  const userId = "widget_user_001";

  useEffect(() => {
    if (window.electronAPI?.onSystemData) {
      window.electronAPI.onSystemData((data) => {
        setStats(data);
        sendEmissionData(userId, data);
      });
    }
  }, []);

  return (
    <div
      style={{
        WebkitAppRegion: "drag",
        background: "white",
        
        padding: "5px",
        width: "240px",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 0 18px rgba(0,0,0,0.22)",
        userSelect: "none",
        position: "relative",
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      {/*  ANIMATION KEYFRAMES */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
          }

          .widget-btn:hover {
            transform: scale(1.15);
            filter: brightness(1.15);
          }
        `}
      </style>

      {/*  MINIMIZE BUTTON */}
      <button
        className="widget-btn"
        onClick={() => window.electronAPI.minimizeWindow()}
        style={{
          position: "absolute",
          top: "8px",
          right: "36px",
          background: "#FFD700",
          border: "none",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
          boxShadow: "0 0 6px rgba(0,0,0,0.25)",
          transition: "0.2s",
        }}
        title="Minimize"
      />

      {/* CLOSE BUTTON */}
      <button
        className="widget-btn"
        onClick={() => window.electronAPI.closeWindow()}
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          background: "#ff5c5c",
          border: "none",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
          boxShadow: "0 0 6px rgba(0,0,0,0.25)",
          transition: "0.2s",
        }}
        title="Close"
      />

      {/* Title */}
      <h3
        style={{
          color: "green",
          marginBottom: "8px",
          marginTop: "6px",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        🌱 CarbonSense
      </h3>

      {/* CPU Load */}
      <p style={{ margin: "6px 0" }}>CPU Load: {stats.cpuLoad}%</p>

      {/* Battery */}
      <p style={{ margin: "6px 0" }}>
        Battery: {stats.batteryPercent}% {stats.isCharging ? "⚡" : "🔋"}
      </p>

      {/* ⭐ Power Usage */}
      <h2
        style={{
          margin: "6px 0",
          color: "#222",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        {stats.powerUsage} W
      </h2>

      {/* CO₂ Emission */}
      <h3
        style={{
          margin: "5px 0",
          color: "#333",
          fontSize: "18px",
          fontWeight: "700",
        }}
      >
        {stats.co2Emission} g CO₂/min
      </h3>

      <small style={{ opacity: 0.7, WebkitAppRegion: "no-drag" }}>
        Synced to Server
      </small>
    </div>
  );
}
