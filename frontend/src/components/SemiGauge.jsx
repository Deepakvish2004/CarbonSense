import React from "react";

export default function SemiGauge({ value }) {
  const max = 30; 
  const percent = Math.min(value / max, 1);

  
  const angle = -90 + percent * 180;

  
  let color = "#22c55e"; 
  let label = "Low Risk";
  let gradientId = "g1";

  if (value >= 20 && value < 30) {
    color = "#eab308";
    label = "Moderate Risk";
    gradientId = "g2";
  } else if (value >= 30) {
    color = "#dc2626";
    label = "High Risk";
    gradientId = "g3";
  }

  
  const glow = `${color}55`;

  return (
    <div className="flex flex-col items-center gap-4">

      {/* SEMI-CIRCLE ARC */}
      <div className="relative w-64 h-32">

        <svg width="100%" height="100%" viewBox="0 0 100 50">

          {/* Background Arc */}
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Gradient Declarations */}
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>

            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>

            <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* COLORED ARC with animation */}
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeDasharray={`${percent * 126}, 200`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>

        {/* NEEDLE */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom w-1 h-16 rounded-full shadow-lg"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            background: color,
            boxShadow: `0 0 10px ${glow}, 0 0 20px ${glow}`,
            transition: "0.6s ease",
          }}
        ></div>

        {/* Needle Center Circle */}
        <div
          className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full"
          style={{
            transform: "translate(-50%, 50%)",
            background: color,
            boxShadow: `0 0 10px ${glow}`,
          }}
        ></div>
      </div>

      {/* LABEL */}
      <p className="font-bold text-lg tracking-wide" style={{ color }}>
        {label} — {value.toFixed(2)} kg
      </p>
    </div>
  );
}
