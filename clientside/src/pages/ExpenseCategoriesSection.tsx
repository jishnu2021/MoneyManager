import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const API = import.meta.env.VITE_API_URI; // http://localhost:3000/api
const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

type RawCategory = Record<string, any>;
type Category = { name: string; amount: number };

const findArrayInPayload = (payload: any): RawCategory[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  // common shapes to try
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.categories)) return payload.categories;
  if (Array.isArray(payload.analytics)) return payload.analytics;
  if (Array.isArray(payload.result)) return payload.result;
  // try nested values
  for (const key of Object.keys(payload)) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const normalize = (arr: RawCategory[]): Category[] =>
  arr.map((item) => {
    const name = item.name ?? item.category ?? item._id ?? item.label ?? "Unknown";
    const amount = Number(item.amount ?? item.total ?? item.value ?? 0) || 0;
    return { name, amount };
  });

const ExpenseCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/expenseanalytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

const expenses = res.data.expenses || [];
const total = expenses.reduce((sum:any, exp:any) => sum + (exp.totalExpense || 0), 0);

const normalized = expenses.map((exp:any, idx:number) => ({
  name: exp.category ?? "Unknown",
  amount: Number(exp.totalExpense) || 0,   // <-- use totalExpense
  percentage: exp.percentageOfIncome 
    ? Number(exp.percentageOfIncome) 
    : (total > 0 ? ((Number(exp.totalExpense) / total) * 100).toFixed(1) : 0),
  color: COLORS[idx % COLORS.length],
}));

      console.log("Normalized",normalized);
      
      setCategories(normalized);
    } catch (err) {
      console.error("Error fetching expense analytics:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  fetchAnalytics();
}, [API]);

  // metrics (safe)
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const highest = categories.length ? categories.reduce((max, c) => (c.amount > max.amount ? c : max)) : { name: "N/A", amount: 0 };
  const lowest = categories.length ? categories.reduce((min, c) => (c.amount < min.amount ? c : min)) : { name: "N/A", amount: 0 };
  const avg = categories.length ? Number((total / categories.length).toFixed(2)) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Expense Categories</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading analytics...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">No expense data available</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">
                        {total > 0 ? ((category.amount / total) * 100).toFixed(1) : "0.0"}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">${category.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart */}
      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="amount" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">${total.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500">Highest Category</p>
            <p className="text-2xl font-bold text-blue-600">
              {highest?.name} (${highest?.amount.toLocaleString()})
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500">Average per Category</p>
            <p className="text-2xl font-bold text-green-600">${avg.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoriesSection;
