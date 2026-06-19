import express from "express";
import {
  resisterUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controllers.js";
import { adminOnly, verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", resisterUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getCurrentUser);
router.get("/all-users", verifyJWT, adminOnly, getAllUsers);
router.get("/:id", getUserById, verifyJWT);
router.patch("/:id", verifyJWT, updateUser);
router.delete("/:id", verifyJWT, adminOnly, deleteUser);
export default router;
