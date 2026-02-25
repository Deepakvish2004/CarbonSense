import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function LoginPage() {
  const [data, setData] = useState({ email: "", password: "" });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", data);
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      alert("Login Successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.4 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-teal-100 relative overflow-hidden">
      {/* Colorful Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-green-300 rounded-full opacity-30 blur-xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300 rounded-full opacity-25 blur-2xl"
          animate={{ scale: [1, 1.1, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-300 rounded-full opacity-20 blur-lg"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-purple-300 rounded-full opacity-15 blur-md"
          animate={{ scale: [1, 1.3, 1], y: [0, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-80 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-center text-2xl font-bold mb-6 text-green-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          🌱 Login
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            variants={inputVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            variants={inputVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </form>
        <motion.p
          className="text-center text-sm text-gray-600 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Don't have an account?{" "}
          <a href="/register" className="text-green-600 hover:text-green-800 underline">
            Register here
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
