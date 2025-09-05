import React, { useState, useEffect } from 'react';
import { Search,TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URI; // ✅ http://localhost:3000/api

const TransactionsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
  });

  // Fetch transactions from backend
  useEffect(() => {
      const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URI || 'http://localhost:3000/api';
      
      // Fetch total budget
      const totalBudgetRes = await fetch(`${baseUrl}/total-budget`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const totalBudgetData = await totalBudgetRes.json();

      setDashboardData({
        totalBalance: totalBudgetData.totalBudget || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);

    }
  };

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API}/transaction`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if protected
          },
        });
      
        setTransactions(res.data); // ✅ backend already returns array
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    fetchDashboardData()
  }, []);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white mb-6">
          <h3 className="text-lg opacity-90 mb-2">Total Balance</h3>
          <p className="text-4xl font-bold">${dashboardData.totalBalance.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading transactions...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">{transaction.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {transaction.category || "N/A"}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsSection;
