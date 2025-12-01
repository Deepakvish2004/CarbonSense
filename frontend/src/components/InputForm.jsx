import React, { useState } from "react";
import axios from "axios";

export default function InputForm({ onResult }) {
  const [data, setData] = useState({ deviceType: "", powerRating: "", usageHours: "" });
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const res = await axios.post("http://localhost:5000/api/footprint/calculate", data, config);
    alert("Calculation saved!");
    onResult(); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="deviceType" placeholder="Device Type" onChange={handleChange} />
      <input type="number" name="powerRating" placeholder="Power (W)" onChange={handleChange} />
      <input type="number" name="usageHours" placeholder="Hours/day" onChange={handleChange} />
      <button type="submit">Calculate</button>
    </form>
  );
}
