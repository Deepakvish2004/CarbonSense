import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

// Normal user protection
export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error("User auth error:", error);
    res.status(401).json({ message: "Token failed" });
  }
};

// ✅ Admin authentication (separate model)
export const protectAdmin = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(403).json({ message: "Access denied — Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ message: "Invalid admin token" });
  }
};
