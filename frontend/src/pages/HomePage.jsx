import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HomePage() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Typing effect for title
  const titleText = "🌱 Computer Carbon Footprint Analyzer";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < titleText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(displayedText + titleText[index]);
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [index, displayedText]);

  // Mock database fetch for user stats (extensive modification: simulate API call)
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate database fetch
    const fetchStats = async () => {
      setLoading(true);
      // Mock API call to database (replace with actual endpoint)
      setTimeout(() => {
        setUserStats({
          totalEmissions: "45.2 kg CO₂",
          devicesTracked: 3,
          reductionTips: ["Turn off unused devices", "Use energy-efficient modes"]
        });
        setLoading(false);
      }, 2000); // Simulate delay
    };
    if (userInfo) fetchStats();
  }, [userInfo]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col items-center justify-start text-center px-6 pb-20 relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-200 rounded-full opacity-15 blur-2xl"
          animate={{ scale: [1, 1.2, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-25 blur-lg"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Enhanced Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 text-4xl opacity-40"
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          🍃
        </motion.div>
        <motion.div
          className="absolute top-70 right-20 text-4xl opacity-40"
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          🍃
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-3xl opacity-80"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          🌿
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-20 text-3xl opacity-80"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          🌿
        </motion.div>
        <motion.div
  className="absolute top-1/3 right-1/3 text-3xl font-bold text-green-900 opacity-80"
  animate={{ scale: [1, 1.4, 1], y: [0, -10, 0] }}
  transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
>
  CO₂
</motion.div>

<motion.div
  className="absolute top-1/3 left-1/3 text-4xl font-extrabold text-green-900 opacity-30 tracking-wide"
  animate={{ scale: [1, 1.4, 1], y: [0, -10, 0] }}
  transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
>
   Emission
</motion.div>

      <motion.div
  className="absolute bottom-1/3 left-1/3 text-4xl font-extrabold text-green-900 opacity-40 drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    filter: ["blur(0px)", "blur(1px)", "blur(0px)"], 
    y: [0, -8, 0],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  }}
>
  🔋
</motion.div>

      </motion.div>

      {/*  Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="mt-24 relative z-10"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-green-800 mb-6 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 80 }}
        >
          {displayedText}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Measure, track, and reduce your computer's carbon emissions.
          <br />
          Empower sustainable digital habits and contribute to a greener planet 🌍.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
        >
          {userInfo ? (
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Dashboard
            </motion.button>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="bg-white border-2 border-green-600 text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 hover:shadow-lg transition-all duration-300 inline-block"
                >
                  Register
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.p
        className="text-center text-gray-600 text-sm mt-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        Don’t have an admin account?{" "}
        <Link
          to="/admin/register"
          className="text-green-700 underline hover:text-green-900 transition-colors duration-300"
        >
          Register here
        </Link>
      </motion.p>

      {/* Key Features (Removed theory section, focused on features) */}
      <motion.div
        className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          {
            title: " CO₂ Calculator",
            text: "Instantly calculate your device's carbon emission based on usage time and power.",
          },
          {
            title: " Visual Reports",
            text: "Track and visualize your daily energy impact through interactive charts.",
          },
          {
            title: " Secure Login",
            text: "Each user's data is safely stored with JWT authentication and MongoDB.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-green-100"
            whileHover={{ y: -15, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            <motion.h3
              className="text-xl font-bold text-green-800 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
            >
              {feature.title}
            </motion.h3>
            <motion.p
              className="text-gray-600 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              viewport={{ once: true }}
            >
              {feature.text}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      {/*  How It Works */}
      <motion.div
        className="mt-24 max-w-5xl text-center relative z-10"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-green-800 mb-8"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
          🛠️ How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Input Data", text: "Enter your device usage details like hours and power consumption." },
            { step: "2", title: "Calculate Impact", text: "Our tool computes your carbon footprint in real-time." },
            { step: "3", title: "Track & Reduce", text: "Monitor progress and get tips to lower your emissions." },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="text-4xl font-bold text-green-600 mb-4">{step.step}</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/*  User Stats Section (Extensive Database Modification) */}
      {userInfo && (
        <motion.div
          className="mt-24 max-w-4xl text-center relative z-10"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-green-800 mb-8"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
          >
            Your Stats
          </motion.h2>
          {loading ? (
            <motion.div
              className="flex justify-center items-center h-32"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-green-800 mb-2">Total Emissions</h3>
                <p className="text-2xl font-bold text-green-600">{userStats.totalEmissions}</p>
              </motion.div>
              <motion.div
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-green-800 mb-2">Devices Tracked</h3>
                <p className="text-2xl font-bold text-green-600">{userStats.devicesTracked}</p>
              </motion.div>
              <motion.div
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-green-800 mb-2">Reduction Tips</h3>
                <ul className="text-gray-600 text-left">
                  {userStats.reductionTips.map((tip, idx) => (
                    <li key={idx} className="mb-1">• {tip}</li>
                  ))}
                </ul>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/*  About Link */}
      <motion.div
        className="mt-20 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1, type: "spring" }}
        viewport={{ once: true }}
      >
        <Link
          to="/about"
          className="text-green-700 underline hover:text-green-900 transition-colors duration-300 text-lg font-medium"
        >
          Learn more about this project →
        </Link>
      </motion.div>

      {/*  Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        viewport={{ once: true }}
        className="mt-24 text-gray-600 text-sm relative z-10 flex flex-col items-center gap-4"
      >
        <div className="flex gap-6">
          <a href="#" className="text-green-600 hover:text-green-800 transition-colors">GitHub</a>
          <a href="#" className="text-green-600 hover:text-green-800 transition-colors">LinkedIn</a>
          <a href="#" className="text-green-600 hover:text-green-800 transition-colors">Twitter</a>
        </div>
        <p>Developed by <b>Deepak Vishwakarma</b> | Semester 6 Project © 2025</p>
      </motion.footer>
    </div>
  );
}
