import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/admin/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("adminInfo", JSON.stringify(data));
      alert("✅ Admin registered successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">
          🧑‍💼 Admin Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          Already an admin?{" "}
          <Link to="/admin/login" className="text-green-700 underline hover:text-green-900">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
