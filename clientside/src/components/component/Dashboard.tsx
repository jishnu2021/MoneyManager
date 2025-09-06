import { useState } from 'react';
import { 
  BarChart3,
  Wallet, 
  CreditCard, 
  PieChart, 
  Target, 
  Calendar, 
  TrendingUp,
  Activity,
  Bot,
  Bell,
  Settings,
  Download,
  Menu
} from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import TransactionsSection from '../../pages/TransactionSection';
import ExpenseCategoriesSection from '../../pages/ExpenseCategoriesSection';
import GoalsSection from '../../pages/GoalSection';
import BillsSection from '../../pages/BillsSection';
import AIAssistantSection from '../../pages/AIAssistantSection';
import AnalyticsSection from '../../pages/AnalyticsSection';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Dashboard Overview' },
    { id: 'transactions', icon: CreditCard, label: 'Recent Transactions' },
    { id: 'expenses', icon: PieChart, label: 'Expense Categories' },
    { id: 'goals', icon: TrendingUp, label: 'Financial Goals' },
    { id: 'bills', icon: Calendar, label: 'Upcoming Bills' },
    { id: 'ai-assistant', icon: Bot, label: 'AI Assistant' },
    { id: 'analytics', icon: BarChart3, label: 'Expense Analytics' }
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/export', {
        method: 'GET',
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
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show a toast notification or alert here
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'overview': return <DashboardOverview />;
      case 'transactions': return <TransactionsSection />;
      case 'expenses': return <ExpenseCategoriesSection />;
      case 'goals': return <GoalsSection />;
      case 'bills': return <BillsSection />;
      case 'ai-assistant': return <AIAssistantSection />;
      case 'analytics': return <AnalyticsSection />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-xl fixed left-0 top-0 h-full overflow-y-auto z-30 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`} style={{marginTop:'4rem'}}>
        <nav className="p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 sm:px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${
                  activeSection === item.id ? 'text-white' : 'text-gray-500'
                }`} />
                <span className="font-medium text-xs sm:text-sm lg:text-base">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-64 flex-1">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <h1 className="font-bold text-sm sm:text-lg truncate">
            {sidebarItems.find(item => item.id === activeSection)?.label}
          </h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-8">
          {/* Desktop header */}
          <div className="mb-6 sm:mb-8 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <Settings className="h-5 w-5 text-gray-600" />
                </button>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm lg:text-base ${
                    isExporting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Download className={`h-4 w-4 mr-1 lg:mr-2 inline ${isExporting ? 'animate-spin' : ''}`} />
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;