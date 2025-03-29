import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Unauthorized: No token provided" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SEC);
    
    if (!decodedData) {
      return res.status(400).json({ message: "Token expired or invalid" });
    }

    req.user = await User.findById(decodedData.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Please login" });
  }
};
