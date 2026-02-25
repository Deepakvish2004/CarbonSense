import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WastePage from "./pages/WastePage";
import PredictionPage from "./pages/PredictionPage";
import AllHistoryPage from "./pages/AllHistoryPage";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminManageAlerts from "./pages/AdminManageAlerts";
import AdminManagement from "./pages/AdminManagement"; // ✅ FIX
import LocationInsights from "./pages/LocationInsights";
import WidgetHistoryPage from "./pages/WidgetHistoryPage";
import UserInbox from "./pages/UserInbox";

function Layout() {
  const location = useLocation();

  const hideNavbarPaths = ["/dashboard"];
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname) && userInfo;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wastepage" element={<WastePage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/location-insights" element={<LocationInsights />} />
        <Route path="/history" element={<AllHistoryPage />} />
        <Route path="/widget-history" element={<WidgetHistoryPage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/alerts" element={<AdminManageAlerts />} />
        <Route path="/admin/management" element={<AdminManagement />} />
        <Route path="/user/inbox" element={<UserInbox />} />
      </Routes>

      <ChatWidget />
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
