import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

// Components
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WastePage from "./pages/WastePage";
import PredictionPage from "./pages/PredictionPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminManageAlerts from "./pages/AdminManageAlerts";


// --------------------------------------------------
// ✅ Layout Component (Controls Navbar visibility)
// --------------------------------------------------
function Layout() {
  const location = useLocation();

  // Paths where navbar should be hidden
  const hideNavbarPaths = ["/dashboard"];

  // Check user login
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Condition to hide navbar
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) && userInfo;

  return (
    <>
      {/* Show Navbar unless dashboard + user logged in */}
      {!shouldHideNavbar && <Navbar />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wastepage" element={<WastePage />} />
        <Route path="/prediction" element={<PredictionPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/alerts" element={<AdminManageAlerts />} />
      </Routes>

      {/* Global Chat Widget (visible on all pages including admin) */}
      <ChatWidget />
    </>
  );
}


// --------------------------------------------------
// ✅ Main App Component
// --------------------------------------------------
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
