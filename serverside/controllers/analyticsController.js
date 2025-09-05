import Transaction from "../models/ExpenseModel.js";

export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Current month range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // 1. Monthly totals: income & expense
    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    const income = monthlyTotals.find(t => t._id === "income")?.total || 0;
    const expense = monthlyTotals.find(t => t._id === "expense")?.total || 0;

    // 2. Expenses by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: "$title", total: { $sum: "$amount" } } }
    ]);

    // 3. Daily trends (income & expense per day)
    const dailyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$date" }, type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    const dailyData = {};
    dailyTrends.forEach(entry => {
      const day = entry._id.day;
      if (!dailyData[day]) {
        dailyData[day] = { day, income: 0, expense: 0 };
      }
      dailyData[day][entry._id.type] = entry.total;
    });

    // Convert to array
    const dailyArray = Object.values(dailyData);

    // 4. Density plot (distribution of transaction amounts)
    const allTransactions = await Transaction.find({
      userId: userId,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    }).select("amount type");

    const densityData = allTransactions.map(t => ({
      amount: t.amount,
      type: t.type
    }));

    // Final response
    res.status(200).json({
      monthlySummary: {
        income,
        expense,
        netSavings: income - expense
      },
      expensesByCategory: expensesByCategory.map(e => ({
        category: e._id,
        total: e.total
      })),
      dailyTrends: dailyArray,
      densityData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};