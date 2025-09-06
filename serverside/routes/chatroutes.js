import express from "express";
import { askAssistant, getChatHistory } from "../controllers/AIAssistantController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/ask", authenticateToken, askAssistant);
router.get("/history", authenticateToken, getChatHistory);

export default router;
