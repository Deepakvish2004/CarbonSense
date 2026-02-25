import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, BarChart3, LayoutDashboard, LogOut } from "lucide-react"; // icons
import { motion } from "framer-motion";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("adminInfo");
      alert("You have been logged out.");
      navigate("/admin/login");
    }
  };

  const links = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
    { label: "Reports", icon: <BarChart3 size={18} />, path: "/reports" },
    { label: " Manage Alert", icon: <BarChart3 size={18} />, path: "/admin/alerts" },
    
    

  ];

  return (
    <div className="bg-green-700 text-white shadow-md">
      {/* Top Bar for Small Screens */}
      <div className="flex justify-between items-center px-4 py-3 md:hidden">
        <h1 className="text-lg font-bold">👨‍💼 Admin Panel</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar for Large Screens */}
      <div className="hidden md:flex flex-col w-64 min-h-screen bg-green-800 p-5 fixed top-0 left-0 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">🌱 Admin Panel</h2>

        {links.map((link, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-green-600 text-left transition"
            onClick={() => navigate(link.path)}
          >
            {link.icon}
            {link.label}
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-red-600 text-left mt-10 transition"
        >
          <LogOut size={18} /> Logout
        </motion.button>

        <div className="mt-auto text-center text-sm opacity-80">
          <p>{adminInfo?.name}</p>
          <p className="text-xs">{adminInfo?.email}</p>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-green-800 md:hidden p-4 space-y-3"
        >
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => {
                setIsOpen(false);
                navigate(link.path);
              }}
              className="block w-full text-left py-2 px-4 rounded hover:bg-green-600 transition"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </motion.div>
      )}
    </div>
  );
}
