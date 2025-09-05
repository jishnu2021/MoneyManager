import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Target } from "lucide-react";

type Goal = {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
};

const GoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
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

  // Handle form submit
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/goals`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setShowModal(false);
      setFormData({ title: "", description: "", category: "", targetAmount: "", deadline: "" });
      // refresh goals
      const res = await axios.get(`${API}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      console.log("the result is: ",res);
      
      setGoals(res.data);
    } catch (err) {
      console.error("Error adding goal", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2);
            return (
              <div key={goal._id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <Target className="h-6 w-6 text-blue-600" />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}</p>
                  <p className="mt-2">Remaining: ${(goal.targetAmount - goal.currentAmount).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Goal Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Target Amount"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
