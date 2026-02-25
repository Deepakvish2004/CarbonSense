import React from "react";
import WidgetDisplay from "./components/WidgetDisplay";

export default function App() {
  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        padding: "10px 15px",
        fontFamily: "Inter, sans-serif",
        width: "240px",
      }}
    >
      <WidgetDisplay />
    </div>
  );
}
