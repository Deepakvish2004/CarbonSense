import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      viewport={{ once: true }}
      className="
        w-full mt-28 
        relative z-10 
        flex flex-col items-center gap-6 
        py-12 px-5
        bg-gradient-to-b from-white/90 to-green-500
        backdrop-blur-xl
        border-t border-green-300/60 
        rounded-t-3xl
        shadow-[0_-10px_30px_rgba(0,0,0,0.06)]
      "
    >
      {/* Soft Glow Accent */}
      <div className="absolute top-0 w-40 h-2 bg-green-400 blur-xl rounded-full"></div>

      {/* Decorative Line */}
      <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-700 rounded-full shadow-md"></div>

      {/* Social Icons */}
      <div className="flex gap-8 mt-2">
        <a
          href="https://github.com/Deepakvish2004/"
          className="text-green-700 hover:text-green-900 transition-all transform hover:scale-125"
        >
          <Github size={26} />
        </a>
        <a
          href="#"
          className="text-green-700 hover:text-green-900 transition-all transform hover:scale-125"
        >
          <Linkedin size={26} />
        </a>
        <a
          href="#"
          className="text-green-700 hover:text-green-900 transition-all transform hover:scale-125"
        >
          <Twitter size={26} />
        </a>
      </div>

      {/* Developer Info */}
      <div className="text-center leading-relaxed">
        <p className="text-gray-700 font-medium">
          © {new Date().getFullYear()} — Developed by{" "}
          <span className="text-green-700 font-semibold">
            Deepak Vishwakarma
          </span>
        </p>
        <p className="text-sm text-gray-600 opacity-80 mt-1">
          Computer Carbon Footprint Analyzer 
        </p>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 w-56 h-12 bg-green-900 blur-3xl rounded-full"></div>
    </motion.footer>
  );
}
