import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/admin/auth/login", form);
      localStorage.setItem("adminInfo", JSON.stringify(data));
      alert("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">
          👨‍💼 Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
