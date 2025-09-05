import express from 'express';
import { addTransaction, getMonthlyTotals, getTransactions,getTotalBudget, getSavingsRate,getExpensePercentages } from '../controllers/TransactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/transaction',authenticateToken,addTransaction)
router.get('/transaction',authenticateToken,getTransactions)
router.get('/monthlytransaction',authenticateToken,getMonthlyTotals)
router.get("/total-budget", authenticateToken, getTotalBudget);
router.get('/savings-rate',authenticateToken,getSavingsRate)
router.get('/expenseanalytics',authenticateToken,getExpensePercentages)

export default router