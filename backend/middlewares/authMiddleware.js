import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Invalid access Token - user not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res.status(401).json({ message: "Invalid access Token error.", error: error.message });
  }
};
