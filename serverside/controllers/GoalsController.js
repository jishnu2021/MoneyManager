import Goal from "../models/GoalsSchema.js";

export const addGoal = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { title, description, category, targetAmount, deadline } = req.body;

    const newGoal = new Goal({
      userId,
      title,
      description,
      category,
      targetAmount,
      deadline
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};


export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id;

    const goals = await Goal.find({ userId });

    // Calculate progress for each goal
    const goalsWithProgress = goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      return {
        ...goal.toObject(),
        progress: progress > 100 ? 100 : progress.toFixed(2)  // cap at 100%
      };
    });

    res.status(200).json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals", error: error.message });
  }
};

export const contributeToGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goalId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Contribution amount must be greater than 0" });
    }

    // Find goal
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Add contribution
    goal.contributions.push({ amount });
    goal.currentAmount += amount;

    // Update status if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed";
    }

    await goal.save();

    res.status(200).json({
      message: "Contribution added successfully",
      goal: {
        ...goal.toObject(),
        progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding contribution", error: error.message });
  }
};