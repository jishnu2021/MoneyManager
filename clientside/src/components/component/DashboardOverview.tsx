import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  Activity,
  Target,
  Download,
  Plus,
  X,
  DollarSign,
} from "lucide-react";

const DashboardOverview = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    savingsRate: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    source: "",
    paymentMethod: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ];

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Bonus",
    "Gift",
    "Other",
  ];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Digital Wallet",
    "Check",
    "Other",
  ];
  const baseUrl = import.meta.env.VITE_API_URI || "http://localhost:3000/api"
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const totalBudgetRes = await fetch(`${baseUrl}/total-budget`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const totalBudgetData = await totalBudgetRes.json();

      const monthlyRes = await fetch(`${baseUrl}/monthlytransaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const monthlyData = await monthlyRes.json();

      // Fetch savings rate
      const savingsRes = await fetch(`${baseUrl}/savings-rate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const savingsData = await savingsRes.json();

      setDashboardData({
        totalBalance: totalBudgetData.totalBudget || 0,
        monthlyIncome: monthlyData.income || 0,
        monthlyExpense: monthlyData.expense || 0,
        savingsRate: savingsData.savingsRate || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback data
      setDashboardData({
        totalBalance: 45750.8,
        monthlyIncome: 5200,
        monthlyExpense: 2450,
        savingsRate: 53,
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/export`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `financial-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      // You might want to show a toast notification or alert here
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const openForm = (type: any) => {
    setFormType(type);
    setShowForm(true);
    setFormData({
      title: "",
      amount: "",
      category: "",
      source: "",
      paymentMethod: "",
      notes: "",
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      title: "",
      amount: "",
      category: "",
      source: "",
      paymentMethod: "",
      notes: "",
    });
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.amount || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/transaction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          type: formType,
        }),
      });

      if (response.ok) {
        alert(
          `${formType === "income" ? "Income" : "Expense"} added successfully!`
        );
        closeForm();
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to add transaction"}`);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transaction Form Component
  const TransactionForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={closeForm}
      />

      {/* Form Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div
          className={`p-4 rounded-t-2xl text-white ${
            formType === "income"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-pink-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Add {formType === "income" ? "Income" : "Expense"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={`Enter ${formType} title`}
              required
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select category</option>
              {(formType === "income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Source or Payment Method */}
          {formType === "income" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Company Name, Client"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Add any notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.title.trim() || !formData.amount || isSubmitting
              }
              className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                formType === "income"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              }`}
            >
              {isSubmitting
                ? "Adding..."
                : `Add ${formType === "income" ? "Income" : "Expense"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Total Balance</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                ${dashboardData.totalBalance.toLocaleString()}
              </p>
            </div>
            <Wallet className="h-6 w-6 lg:h-8 lg:w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm">
                Monthly Income
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                ${dashboardData.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm">
                Monthly Expenses
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                ${dashboardData.monthlyExpense.toLocaleString()}
              </p>
            </div>
            <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Savings Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                {dashboardData.savingsRate}%
              </p>
            </div>
            <Target className="h-6 w-6 lg:h-8 lg:w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions and Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => openForm("income")}
              className="flex items-center justify-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
              <span className="text-green-600 text-sm sm:text-base font-medium">
                Add Income
              </span>
            </button>
            <button
              onClick={() => openForm("expense")}
              className="flex items-center justify-center p-3 sm:p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600" />
              <span className="text-red-600 text-sm sm:text-base font-medium">
                Add Expense
              </span>
            </button>
            <button
              className="flex items-center justify-center p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              onClick={() => openForm("expense")}
            >
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              <span className="text-blue-600 text-sm sm:text-base font-medium">
                Set Goal
              </span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm lg:text-base ${
                isExporting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Download
                className={`h-4 w-4 mr-1 lg:mr-2 inline ${
                  isExporting ? "animate-spin" : ""
                }`}
              />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Financial Summary
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">
                Net Income
              </span>
              <span className="font-semibold text-green-600 text-sm sm:text-base">
                $
                {(
                  dashboardData.monthlyIncome - dashboardData.monthlyExpense
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">
                Expense Ratio
              </span>
              <span className="font-semibold text-orange-600 text-sm sm:text-base">
                {dashboardData.monthlyIncome > 0
                  ? (
                      (dashboardData.monthlyExpense /
                        dashboardData.monthlyIncome) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">
                Monthly Savings
              </span>
              <span className="font-semibold text-blue-600 text-sm sm:text-base">
                $
                {Math.max(
                  0,
                  dashboardData.monthlyIncome - dashboardData.monthlyExpense
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 lg:hidden z-40">
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <button
            onClick={() => openForm("income")}
            className="bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            title="Add Income"
          >
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={() => openForm("expense")}
            className="bg-red-500 hover:bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            title="Add Expense"
          >
            <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && <TransactionForm />}
    </div>
  );
};

export default DashboardOverview;
