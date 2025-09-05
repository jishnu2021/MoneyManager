import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

import { ArrowUp, ArrowDown } from "lucide-react";

const API = import.meta.env.VITE_API_URI; // http://localhost:3000/api

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

const AnalyticsSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [density, setDensity] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/getanalytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        console.log("Analytics API response:", res.data);

        setSummary(res.data.monthlySummary);
        setCategories(res.data.expensesByCategory);
        setTrends(res.data.dailyTrends);
        setDensity(res.data.densityData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading analytics...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Expense Analytics</h2>

        {/* Radar Chart → Category Performance */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <RadarChart data={categories}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar
                  name="Expenses"
                  dataKey="total"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart → Monthly Summary */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "Income", value: summary?.income },
                  { name: "Expense", value: summary?.expense },
                  { name: "Net Savings", value: summary?.netSavings },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart → Daily Trends */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Trends</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4ECDC4" />
                <Line type="monotone" dataKey="expense" stroke="#FF6B6B" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Density Plot → Income vs Expense Distribution */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Density</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="amount" name="Amount" />
                <YAxis type="category" dataKey="type" name="Type" />
                <ZAxis range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="Transactions" data={density} fill="#82ca9d" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
