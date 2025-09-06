import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  changePassword,
  deleteProfileImage,
  getUserStats,
  updateBudget,
  upload,
} from "../controllers/User-controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
// Profile routes
router.get("/profile", authenticateToken, getUserProfile);
router.put("/update", authenticateToken, updateUserProfile);
router.get("/stats", authenticateToken, getUserStats);

// Budget route
router.put("/budget", authenticateToken, updateBudget);

// Image upload routes
router.post("/upload-image", authenticateToken, upload.single('image'), uploadProfileImage);
router.delete("/delete-image", authenticateToken, deleteProfileImage);

// Security routes
router.put("/change-password", authenticateToken, changePassword);

export default router;