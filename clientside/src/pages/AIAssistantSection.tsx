import { useState, useEffect } from "react";
import axios from "axios";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
const API_URI = import.meta.env.VITE_API_URI;

const AIAssistantSection = () => {
  const [question, setQuestion] = useState("");
  type Message = {
    role: "user" | "assistant";
    content: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch chat history on load
 useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URI}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Ensure it's an array
      setMessages(Array.isArray(res.data) ? res.data : res.data.history || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };
  fetchHistory();
}, []);

const handleAsk = async () => {
  if (!question.trim()) return;
  setLoading(true);

  try {
    const res = await axios.post(
      `${API_URI}/ask`,
      { question },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    setMessages(
      Array.isArray(res.data.history) ? res.data.history : []
    );
    setQuestion("");
  } catch (err) {
    console.error("Error asking AI:", err);
  } finally {
    setLoading(false);
  }
};


  // Quick question handler
  const handleQuickAsk = (q: any) => {
    setQuestion(q);
    setTimeout(() => handleAsk(), 200); // auto-send
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold">AI Financial Assistant</h2>
        </div>

        {/* Chat History */}
        <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No conversation yet. Ask something!
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border rounded-xl p-4">
          <h4 className="font-semibold mb-3">Ask Your Financial Assistant</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask about your finances, budgets, or advice..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAsk}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>

          {/* Quick Questions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
            <button
              onClick={() => handleQuickAsk("How can I save more money?")}
              className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
            >
              "How can I save more money?"
            </button>
            <button
              onClick={() => handleQuickAsk("Analyze my spending patterns")}
              className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
            >
              "Analyze my spending patterns"
            </button>
            <button
              onClick={() =>
                handleQuickAsk("Give me investment recommendations")
              }
              className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
            >
              "Investment recommendations"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSection;
