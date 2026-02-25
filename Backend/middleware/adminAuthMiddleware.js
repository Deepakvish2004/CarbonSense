import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(403).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};
