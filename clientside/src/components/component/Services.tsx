import React, { useState } from 'react';
import { 
  BarChart3,
  CreditCard, 
  PieChart, 
  Target, 
  Calendar, 
  TrendingUp,
  Bot,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Smartphone,
  Cloud,
  Zap,
  Users,
  DollarSign,
  Bell,
  FileText,
  Lightbulb,
  Lock
} from 'lucide-react';

const Services = () => {
  const [activeService, setActiveService] = useState(0);

  const mainServices = [
    {
      id: 'overview',
      icon: BarChart3,
      title: 'Dashboard Overview',
      description: 'Get a comprehensive view of your financial health with real-time insights and beautiful visualizations.',
      features: ['Real-time balance tracking', 'Visual spending patterns', 'Monthly/yearly comparisons', 'Quick financial snapshots'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'transactions',
      icon: CreditCard,
      title: 'Transaction Management',
      description: 'Effortlessly track, categorize, and manage all your financial transactions in one place.',
      features: ['Automatic categorization', 'Receipt scanning', 'Transaction search & filter', 'Bulk operations'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'expenses',
      icon: PieChart,
      title: 'Expense Analytics',
      description: 'Understand your spending patterns with detailed analytics and interactive charts.',
      features: ['Category breakdown', 'Spending trends', 'Comparative analysis', 'Custom reports'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'budget',
      icon: Target,
      title: 'Budget Tracking',
      description: 'Set realistic budgets and track your progress with intelligent alerts and recommendations.',
      features: ['Smart budget suggestions', 'Progress monitoring', 'Overspending alerts', 'Budget optimization'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'goals',
      icon: TrendingUp,
      title: 'Financial Goals',
      description: 'Set and achieve your financial objectives with personalized strategies and milestone tracking.',
      features: ['Goal setting wizard', 'Progress tracking', 'Achievement rewards', 'Strategy recommendations'],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'bills',
      icon: Calendar,
      title: 'Bill Management',
      description: 'Never miss a payment again with intelligent bill tracking and reminder systems.',
      features: ['Payment reminders', 'Due date tracking', 'Recurring bill setup', 'Payment history'],
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'ai-assistant',
      icon: Bot,
      title: 'AI Financial Assistant',
      description: 'Get personalized financial advice and insights powered by advanced artificial intelligence.',
      features: ['Personalized recommendations', '24/7 chat support', 'Spending insights', 'Financial coaching'],
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep dive into your financial data with powerful analytics and forecasting tools.',
      features: ['Predictive modeling', 'Trend analysis', 'Custom dashboards', 'Export capabilities'],
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const additionalServices = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with 256-bit encryption and multi-factor authentication.'
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Access your finances anywhere with our intuitive mobile app for iOS and Android.'
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Seamlessly sync your data across all devices with real-time cloud backup.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay informed with intelligent alerts for spending, bills, and financial opportunities.'
    },
    {
      icon: FileText,
      title: 'Financial Reports',
      description: 'Generate professional PDF reports for taxes, loans, and financial planning.'
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Manage family finances together with shared budgets and expense tracking.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for getting started with personal finance',
      features: ['Up to 100 transactions/month', 'Basic dashboard', 'Expense categorization', 'Mobile app access'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      description: 'Advanced features for serious money managers',
      features: ['Unlimited transactions', 'AI assistant', 'Advanced analytics', 'Bill reminders', 'Goal tracking', 'PDF reports'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Family',
      price: '$19.99',
      period: '/month',
      description: 'Complete financial management for families',
      features: ['Everything in Pro', 'Up to 5 family members', 'Shared budgets', 'Family insights', 'Priority support'],
      cta: 'Start Free Trial',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Comprehensive financial management tools designed to simplify your money management 
              and accelerate your path to financial success.
            </p>
          </div>
        </div>
      </div>

      {/* Main Services Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to take control of your finances in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mainServices.map((service, index) => (
              <div 
                key={service.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-transparent"
                onClick={() => setActiveService(index)}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${service.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <div className="space-y-2">
                  {service.features.slice(0, 2).map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-blue-600 font-medium flex items-center hover:text-blue-700 transition-colors">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Service Detail */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${mainServices[activeService].color} rounded-xl mb-6`}>
                  {/* <mainServices[activeService].icon className="w-8 h-8 text-white" /> */}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {mainServices[activeService].title}
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {mainServices[activeService].description}
                </p>
                <div className="space-y-4">
                  {mainServices[activeService].features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className={`mt-8 bg-gradient-to-r ${mainServices[activeService].color} text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transform hover:scale-105 transition-all duration-200`}>
                  Try This Feature
                </button>
              </div>
              <div className={`bg-gradient-to-br ${mainServices[activeService].color} p-8 lg:p-12 flex items-center justify-center`}>
                <div className="text-center text-white">
                  {/* <mainServices[activeService].icon className="w-32 h-32 mx-auto mb-6 opacity-80" /> */}
                  <h4 className="text-2xl font-bold mb-4">Experience the Power</h4>
                  <p className="text-lg opacity-90">
                    See how {mainServices[activeService].title.toLowerCase()} can transform your financial management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Additional Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extra features and services that make Money Manager the complete financial solution
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 </div>
        
  );
};
export default Services;
                