import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // ✅ Import animation library

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // ✅ Show Navbar only on Home Page (/)
  if (location.pathname !== "/") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    alert("You have been logged out.");
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}      
      animate={{ opacity: 1, y: 0 }}        
      transition={{ duration: 0.8, ease: "easeOut" }} 
      className="bg-green-700 text-white px-8 py-3 flex justify-between items-center shadow-md m-2 rounded-b-2xl"
    >
      {/* Left Side - Logo */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Link to="/" className="text-xl font-bold hover:text-green-500 transition">
          🌍 Carbon Analyzer
        </Link>
      </motion.div>

      {/* Right Side - Menu Links */}
      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" className="hover:text-green-200 transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-green-200 transition">
          About
        </Link>
        

        {userInfo ? (
          <>
            <Link to="/dashboard" className="hover:text-green-200 transition">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-green-200 transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-green-200 transition">
              Register
            </Link>
          </>
        )}
      </motion.div>
    </motion.nav>
  );
}
