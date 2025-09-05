import Transaction from "../models/ExpenseModel.js";
import User from "../models/User.js";

export const addTransaction = async (req, res) => {
  try {
    const userId = req.user._id; 
    console.log("user id is ",userId)
    const { title, amount, type, category, source, paymentMethod, notes } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ message: "Title, amount, and type are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be either income or expense" });
    }

    const transaction = new Transaction({
      userId,
      title,
      amount,
      type,
      category,
      source,
      paymentMethod,
      notes,
    });

    await transaction.save();

    res.status(201).json({
      message: `${type} added successfully`,
      transaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    let filter = { userId };
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyTotals = async (req, res) => {
  try {
    const userId = req.user._id;

    // get start & end of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // aggregate income + expenses for this month
    const totals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // fetch user’s budget
    const user = await User.findById(userId).select("budget");

    let income = 0,
      expense = 0;
    totals.forEach((t) => {
      if (t._id === "income") income = t.total;
      if (t._id === "expense") expense = t.total;
    });


    res.status(200).json({
      income,
      expense,
      budget: user?.budget || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTotalBudget = async (req, res) => {
  try {
   const userId = req.user._id;

    // get start & end of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // aggregate income + expenses for this month
    const totals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const user = await User.findById(userId).select("budget");

    let income = 0,
      expense = 0;
    totals.forEach((t) => {
      if (t._id === "income") income = t.total;
      if (t._id === "expense") expense = t.total;
    });
    const totalBudget = income - expense;
    await User.findByIdAndUpdate(userId, { budget: totalBudget });

    res.json({ totalBudget, income, expense });
  } catch (error) {
    res.status(500).json({ message: "Error calculating budget", error });
  }
};


export const getSavingsRate = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate income & expense totals
    const totals = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    totals.forEach(t => {
      if (t._id === "income") income = t.total;
      if (t._id === "expense") expense = t.total;
    });

    // Avoid division by zero
    if (income === 0) {
      return res.json({
        savingsRate: 0,
        income,
        expense,
        message: "No income recorded, savings rate is 0%"
      });
    }

    const savingsRate = ((income - expense) / income) * 100;

    res.json({
      savingsRate: savingsRate.toFixed(2), 
      income,
      expense
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating savings rate", error });
  }
};

export const getExpensePercentages = async (req, res) => {
  try {
    const userId = req.user._id;
    // Get current month range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // Get monthly income
    const monthlyIncomeAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "income",
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
    ]);

    const monthlyIncome = monthlyIncomeAgg[0]?.totalIncome || 0;

    if (monthlyIncome === 0) {
      return res.status(400).json({ message: `No income found for this month for ${userId}`});
    }

    // Get expense by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: "$title", totalExpense: { $sum: "$amount" } } }
    ]);

    // Add percentage calculation
    const results = expensesByCategory.map(exp => ({
      category: exp._id,
      totalExpense: exp.totalExpense,
      percentageOfIncome: ((exp.totalExpense / monthlyIncome) * 100).toFixed(2)
    }));

    res.status(200).json({ monthlyIncome, expenses: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
