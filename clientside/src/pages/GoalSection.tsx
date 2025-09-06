import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Target, DollarSign, Calendar, TrendingUp } from "lucide-react";

type Goal = {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status?: string;
};

const GoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetAmount: "",
    deadline: ""
  });

  const API = import.meta.env.VITE_API_URI;

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await axios.get(`${API}/goals`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setGoals(res.data);
      } catch (err) {
        console.error("Error fetching goals", err);
      }
    };
    fetchGoals();
  }, [API]);

  // Handle form submit for new goal
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/goals`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setShowModal(false);
      setFormData({ title: "", description: "", category: "", targetAmount: "", deadline: "" });
      
      // Refresh goals
      const res = await axios.get(`${API}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error("Error adding goal", err);
    }
  };

  // Handle contribution
  const handleContribution = async (e: any) => {
    e.preventDefault();
    if (!selectedGoal || !contributionAmount) return;

    try {
      await axios.post(`${API}/goals/${selectedGoal._id}/contribute`, 
        { amount: parseFloat(contributionAmount) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      // Update the goal locally
      setGoals(prev => prev.map(goal => 
        goal._id === selectedGoal._id 
          ? { ...goal, currentAmount: goal.currentAmount + parseFloat(contributionAmount) }
          : goal
      ));

      setShowContributeModal(false);
      setContributionAmount("");
      setSelectedGoal(null);
    } catch (err) {
      console.error("Error adding contribution", err);
    }
  };

  const openContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-400";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Savings': 'bg-green-100 text-green-800',
      'Travel': 'bg-purple-100 text-purple-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Education': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Track and achieve your financial objectives</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = goal.status === 'completed' || progress >= 100;
              
              return (
                <div key={goal._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{goal.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    <Target className={`h-6 w-6 ${isCompleted ? 'text-green-500' : 'text-blue-600'}`} />
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className={`font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                      </span>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {formatDate(goal.deadline)}</span>
                    </div>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => openContributeModal(goal)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Contribute
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center text-green-600 font-semibold py-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Goal Completed!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first financial goal</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g., Emergency Fund"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Optional description of your goal"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="Savings">Savings</option>
                  <option value="Travel">Travel</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Education">Education</option>
                  <option value="General">General</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Add Contribution</h2>
            <p className="text-gray-600 mb-6">Contributing to: <span className="font-semibold">{selectedGoal.title}</span></p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Current Progress</span>
                <span className="font-semibold">
                  {((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(selectedGoal.currentAmount)}</span>
                <span>{formatCurrency(selectedGoal.targetAmount)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contribution Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeModal(false);
                    setContributionAmount("");
                    setSelectedGoal(null);
                  }}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleContribution}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Contribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;