import React, { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        data
      );
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      alert("Registration Successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="
        min-h-screen flex flex-col items-center justify-center 
        bg-[radial-gradient(circle_at_center,_#bbf7d0_80px,_#34d399_250px,_#00000000_650px)],
       bg-[radial-gradient(green_300px,green_100px,transparent_600px)]




        font-sans p-4
      "
    >
      <div
        className="
          bg-white/95 backdrop-blur-sm 
          p-8 rounded-2xl shadow-xl 
          w-96 border border-green-300 
          transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
        "
      >
        <h2 className="text-center text-2xl font-bold text-green-700 mb-5">
          Register 🌿
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="
              w-full p-3 border border-green-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 outline-none 
              text-gray-800
            "
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="
              w-full p-3 border border-green-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 outline-none 
              text-gray-800
            "
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="
              w-full p-3 border border-green-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 outline-none 
              text-gray-800
            "
            required
          />

          <button
            type="submit"
            className="
              w-full bg-green-600 text-white py-3 rounded-lg 
              font-semibold hover:bg-green-700 
              shadow-md hover:shadow-lg transition
            "
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
