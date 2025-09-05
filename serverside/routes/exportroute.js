import express from "express";
import { exportUserReport } from "../controllers/exportController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/export/:userId
router.get("/export", authenticateToken,exportUserReport);

export default router;
