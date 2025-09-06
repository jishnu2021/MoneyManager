import { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Filter,
  TrendingUp,
  CreditCard,
  Bell,
  X,
  Eye,
  Trash2
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Bill = {
  _id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  paymentMethod?: string;
  transactionId?: any;
};

type BillStats = {
  pending: { count: number; totalAmount: number };
  paid: { count: number; totalAmount: number };
  overdue: { count: number; totalAmount: number };
};

const BillsSection = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillStats>({
    pending: { count: 0, totalAmount: 0 },
    paid: { count: 0, totalAmount: 0 },
    overdue: { count: 0, totalAmount: 0 }
  });
  const [showForm, setShowForm] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [newBill, setNewBill] = useState({ 
    title: "", 
    amount: "", 
    dueDate: "",
    notes: ""
  });
  const baseUrl = import.meta.env.VITE_API_URI || "http://localhost:3000/api"
  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    calculateStats();
    filterBills();
  }, [bills, activeFilter]);

  // Calculate statistics from bills data
  const calculateStats = () => {
    const stats = bills.reduce((acc, bill) => {
      const amount = Number(bill.amount);
      acc[bill.status].count += 1;
      acc[bill.status].totalAmount += amount;
      return acc;
    }, {
      pending: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
      overdue: { count: 0, totalAmount: 0 }
    });
    
    setStats(stats);
  };

  // Update bill status based on due date
  const updateBillStatuses = (billsList: Bill[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return billsList.map(bill => {
      if (bill.status === 'pending') {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          return { ...bill, status: 'overdue' as const };
        }
      }
      return bill;
    });
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your bills");
        return;
      }

      const response = await fetch(`${baseUrl}/bills/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const billsList = Array.isArray(data) ? data : (data.bills || []);
      const updatedBills = updateBillStatuses(billsList);
      
      setBills(updatedBills);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    if (activeFilter === 'all') {
      setFilteredBills(bills);
    } else {
      setFilteredBills(bills.filter(bill => bill.status === activeFilter));
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newBill.title.trim() || !newBill.amount || !newBill.dueDate) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (Number(newBill.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/bills/add`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newBill.title.trim(),
          amount: Number(newBill.amount),
          dueDate: newBill.dueDate,
          notes: newBill.notes.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add bill");
      }

      setShowForm(false);
      setNewBill({ title: "", amount: "", dueDate: "", notes: "" });
      await fetchBills();
    } catch (err) {
      console.error("Error adding bill:", err);
      setError(err instanceof Error ? err.message : "Failed to add bill");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (billId: string) => {
    try {
      setPaymentLoading(billId);
      setError(null);

      // Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // Create payment order from backend
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/bills/create-order`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billId })
      });
      console.log("the response",response);
      

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create payment order");
      }

      const data = await response.json();
      const { order, bill } = data;
      console.log("The data is : ",data)
      console.log("The order is : ",order);
      

      const options = {
        key: "rzp_test_RE2rNH42O905Qd", // Move this to environment variables
        amount: order.amount,
        currency: order.currency,
        name: "Money Manager",
        description: `Payment for ${bill.title}`,
        order_id: order.id,
        handler: async (res: any) => {
          try {
            const verifyResponse = await fetch(`${baseUrl}/bills/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                billId,
                paymentMethod: "Razorpay"
              }),
            });

            if (!verifyResponse.ok) {
              const errData = await verifyResponse.json();
              throw new Error(errData.message || "Payment verification failed");
            }

            alert("Payment successful! Your bill has been marked as paid.");
            await fetchBills();

          } catch (err) {
            console.error("Payment verification error:", err);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: () => setPaymentLoading(null),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        setError("Payment failed. Please try again.");
        setPaymentLoading(null);
      });

      rzp.open();
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setPaymentLoading(null);
    }
  };

  const deleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      // Fixed: Pass billId in the URL path
      const response = await fetch(`${baseUrl}/bills/delete/${billId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bill");
      }
      
      await fetchBills();
    } catch (err) {
      console.error("Error deleting bill:", err);
      setError(err instanceof Error ? err.message : "Failed to delete bill");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 border-green-200 text-green-800';
      case 'overdue': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending.count}</p>
                <p className="text-sm text-blue-600">₹{stats.pending.totalAmount.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue.count}</p>
                <p className="text-sm text-red-600">₹{stats.overdue.totalAmount.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paid.count}</p>
                <p className="text-sm text-green-600">₹{stats.paid.totalAmount.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Bills</h2>
                <p className="text-blue-100">Manage all your upcoming and past bills</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add Bill
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-0">
              {[
                { key: 'all', label: 'All Bills', count: bills.length },
                { key: 'pending', label: 'Pending', count: stats.pending.count },
                { key: 'overdue', label: 'Overdue', count: stats.overdue.count },
                { key: 'paid', label: 'Paid', count: stats.paid.count }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeFilter === filter.key
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Bills List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-500">
                  {activeFilter === 'all' ? 'Add your first bill to get started' : `No ${activeFilter} bills at the moment`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBills.map((bill) => {
                  const daysUntilDue = getDaysUntilDue(bill.dueDate);
                  return (
                    <div
                      key={bill._id}
                      className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${getStatusColor(bill.status)}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Bill Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(bill.status)}
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{bill.title}</h4>
                              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                                </span>
                                {bill.status === 'pending' && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    daysUntilDue < 0 ? 'bg-red-100 text-red-800' :
                                    daysUntilDue <= 3 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                     daysUntilDue === 0 ? 'Due today' :
                                     `${daysUntilDue} days left`}
                                  </span>
                                )}
                                {bill.status === 'overdue' && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {Math.abs(daysUntilDue)} days overdue
                                  </span>
                                )}
                                {bill.status === 'paid' && bill.paymentMethod && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CreditCard className="h-4 w-4" />
                                    Paid via {bill.paymentMethod}
                                  </span>
                                )}
                              </div>
                              {bill.notes && (
                                <p className="text-sm text-gray-500 mt-2">{bill.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{bill.amount.toLocaleString()}
                            </p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                              bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowBillDetails(bill)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>

                            {bill.status !== 'paid' && (
                              <>
                                <button
                                  onClick={() => handlePay(bill._id)}
                                  disabled={paymentLoading === bill._id}
                                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    bill.status === 'overdue'
                                      ? 'bg-red-600 hover:bg-red-700 text-white'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  } disabled:opacity-50`}
                                >
                                  {paymentLoading === bill._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <CreditCard className="h-4 w-4" />
                                  )}
                                  Pay Now
                                </button>

                                <button
                                  onClick={() => deleteBill(bill._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete Bill"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Bill Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Add New Bill</h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAddBill} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Electricity Bill"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newBill.title}
                    onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Additional notes..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Bill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bill Details Modal */}
        {showBillDetails && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
                  <button
                    onClick={() => setShowBillDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(showBillDetails.status)}
                  <div>
                    <h4 className="font-bold text-lg">{showBillDetails.title}</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      showBillDetails.status === 'paid' ? 'bg-green-100 text-green-800' :
                      showBillDetails.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {showBillDetails.status.charAt(0).toUpperCase() + showBillDetails.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-bold text-xl">₹{showBillDetails.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold">{new Date(showBillDetails.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {showBillDetails.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-800">{showBillDetails.notes}</p>
                  </div>
                )}

                {showBillDetails.status === 'paid' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Payment Details</p>
                    {showBillDetails.paymentMethod && (
                      <p className="text-green-800">Paid via {showBillDetails.paymentMethod}</p>
                    )}
                    <p className="text-xs text-green-600 mt-1">This bill has been marked as paid and recorded in your expenses.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BillsSection;