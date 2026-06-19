import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const resisterUser = async (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  console.log(req.body);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password, role });

  return res.status(201).json({ message: "User Created" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  return res.status(200).json({ message: "Login Success", role: user.role });
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  return res.status(200).json(users);
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }

  const userById = await User.findById(id).select("-password -refreshToken");

  res.status(200).json(userById);
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }

  // User can update own profile, Admin can update anyone
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return res.status(403).json({
      message: "You can only update your own profile",
    });
  }
  const { name, email } = req.body;

  // Prevent duplicate email
  if (email) {
    const emailExists = await User.findOne({ email });

    if (emailExists && emailExists._id.toString() !== id) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select("-password -refreshToken");

  if (!updateUser) {
    return res.status(404).json({
      message: "User not Found",
    });
  }

  return res.status(200).json({
    message: "User Updated Successfully",
    user: updatedUser,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }

  // Admin cannot delete himself
  if (req.user._id.toString() === id) {
    return res.status(400).json({
      message: "Admin cannot delete own account",
    });
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  return res.status(200).json({
    message: "User Deleted Successfully",
  });
};

export {
  resisterUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
