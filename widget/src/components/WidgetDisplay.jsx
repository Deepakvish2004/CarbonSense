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
      });
    }
  }, []);

  
  const handleSave = async () => {
    await sendEmissionData(userId, stats);
  };

  return (
    <div
      style={{
        WebkitAppRegion: "drag",
        background: "green",
        padding: "5px", 
        height:"180px",
        width: "240px",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 0 1px rgba(0,0,0,0.22)",
        userSelect: "none",
        position: "relative",
        justifyContent: "center",
      }}
    >
      
      <button
        className="widget-btn"
        onClick={handleSave}
        style={{
          position: "absolute",
          top: "8px",
          left: "10px",
          background: "#4CAF50",
          border: "none",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
          boxShadow: "0 0 6px rgba(0,0,0,0.25)",
        }}
        title="Save data"
      />
        
     

      {/* MINIMIZE */}
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
        }}
        title="Minimize"
      />

      {/* CLOSE */}
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
        }}
        title="Close"
      />

      <h3 style={{ color: "white", margin: "8px 0", fontSize: "22px" }}>
  🌱 CarbonSense
</h3>

<p style={{ margin: "9px 0", fontSize: "18px" }}>
  CPU Load: {stats.cpuLoad}%
</p>

<p style={{ margin: "5px 0", fontSize: "18px" }}>
  Battery: {stats.batteryPercent}% {stats.isCharging ? "⚡" : "🔋"}
</p>

<h2 style={{ margin: "6px 0", fontSize: "20px" }}>
  {stats.powerUsage} W
</h2>

<h3 style={{ margin: "6px 0", fontSize: "18px" }}>
  {stats.co2Emission} g CO₂/min
</h3>

<small style={{ marginTop: "2px", fontSize: "16px" ,fontWeight:"bold"}}>
  Live monitoring
</small>

    </div>
  );
}
