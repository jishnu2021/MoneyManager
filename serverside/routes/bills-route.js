import express from "express";
import {
  addBill,
  getBills,
  createBillPaymentOrder,
  verifyBillPayment,
  deleteBill,
  getBillStats,
} from "../controllers/BillsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 🔒 All routes protected with authentication
router.post("/add", authenticateToken, addBill);
router.get("/all", authenticateToken, getBills);
router.get("/stats", authenticateToken, getBillStats); // New route for statistics
router.post("/create-order", authenticateToken, createBillPaymentOrder);
router.post("/verify-payment", authenticateToken, verifyBillPayment);
router.delete('/delete/:billId', authenticateToken, deleteBill); // Fixed: Added :billId parameter

export default router;