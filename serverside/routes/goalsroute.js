import express from "express";
import { addGoal, getGoals,contributeToGoal } from "../controllers/GoalsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/goals", authenticateToken, addGoal);
router.get("/goals", authenticateToken, getGoals);
router.post("/goals/:goalId/contribute", authenticateToken, contributeToGoal);

export default router;
