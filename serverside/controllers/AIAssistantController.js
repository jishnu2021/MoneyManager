import Chat from "../models/Chat.js";
import Transaction from "../models/ExpenseModel.js";
import User from "../models/User.js";
// Example: Using OpenAI (replace with Gemini/LangGraph if you want)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export const askAssistant = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Fetch user financial context
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    const user = await User.findById(userId).select("username budget");

    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const context = `
      User: ${user.username}
      Budget: ${user.budget}
      Total Income: ${totalIncome}
      Total Expense: ${totalExpense}
      Balance: ${balance}
      Transactions: ${transactions
        .map(t => `${t.title} (${t.type}) - $${t.amount}`)
        .join(", ")}
    `;

    // Ask Gemini (chat-style)
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a financial assistant AI. Give smart but simple financial advice." }],
        },
      ],
    });

    const result = await chat.sendMessage([
      { text: `Context:\n${context}` },
      { text: question },
    ]);

    const answer = result.response.text();

    // Save chat in DB
    let chatDoc = await Chat.findOne({ userId });
    if (!chatDoc) {
      chatDoc = new Chat({ userId, messages: [] });
    }
    chatDoc.messages.push({ role: "user", content: question });
    chatDoc.messages.push({ role: "assistant", content: answer });
    await chatDoc.save();

    res.status(200).json({ answer, history: chatDoc.messages });
  } catch (err) {
    console.error("Gemini Assistant Error:", err);
    res.status(500).json({ message: "Error processing request", error: err.message });
  }
};


export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findOne({ userId });
    if (!chat) return res.status(200).json({ messages: [] });
    res.status(200).json(chat.messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat history", error: err.message });
  }
};
