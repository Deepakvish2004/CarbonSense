import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ResultChart({ history }) {
  return (
    <BarChart width={500} height={300} data={history}>
      <XAxis dataKey="deviceType" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="co2Emission" fill="#00cc88" />
    </BarChart>
  );
}
