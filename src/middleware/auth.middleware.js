import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    // console.log("Cookies:", req.cookies);
    // console.log("Token:", req.cookies.accessToken);
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access Denied",
    });
  }

  next();
};
