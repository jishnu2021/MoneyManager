import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  Target, 
  Calendar, 
  Wallet, 
  BarChart3,
  Bell,
  Settings,
  User,
  Search,
  Bot,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  Activity,
  Shield
} from 'lucide-react';  
  
  
  const AIAssistantSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold">AI Financial Assistant</h2>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Smart Insights & Recommendations</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="font-medium text-blue-900">💡 Spending Pattern Alert</p>
              <p className="text-sm text-gray-700 mt-1">
                Your food expenses have increased by 15% compared to last month. Consider meal planning to reduce costs.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="font-medium text-green-900">🎯 Savings Opportunity</p>
              <p className="text-sm text-gray-700 mt-1">
                You can save an additional $200/month by optimizing your subscription services and transport costs.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
              <p className="font-medium text-orange-900">📊 Budget Recommendation</p>
              <p className="text-sm text-gray-700 mt-1">
                Based on your income pattern, consider increasing your emergency fund contribution by $150/month.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-xl p-4">
          <h4 className="font-semibold mb-3">Ask Your Financial Assistant</h4>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Ask about your finances, budgets, or get personalized advice..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Ask AI
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
            <button className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              "How can I save more money?"
            </button>
            <button className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              "Analyze my spending patterns"
            </button>
            <button className="text-left p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              "Investment recommendations"
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  export default AIAssistantSection