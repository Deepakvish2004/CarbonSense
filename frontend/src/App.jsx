import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import PredictionPage from "./pages/PredictionPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import wastepage from "./pages/WastePage";
import AdminManageAlerts from "./pages/AdminManageAlerts.jsx";

import React from "react";
import WastePage from "./pages/WastePage";


// ✅ Helper component to show Navbar conditionally
function Layout() {
  const location = useLocation();
  const hideNavbarPaths = ["/dashboard"]; // hide Navbar only on dashboard

  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) && userInfo;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}  {/* ✅ Navbar hidden if user logged in & on dashboard */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />

        <Route path="/wastepage" element={<WastePage />} />
        <Route path="/prediction" element={<PredictionPage />} />





        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/alerts" element={<AdminManageAlerts />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
