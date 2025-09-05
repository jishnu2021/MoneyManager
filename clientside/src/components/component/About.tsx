import React from 'react';
import { 
  Shield, 
  Users, 
  Award, 
  TrendingUp, 
  Heart, 
  Globe, 
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Lock,
  Target
} from 'lucide-react';

const About = () => {
  const stats = [
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '99.9%', label: 'Uptime', icon: Zap },
    { number: '4.8/5', label: 'User Rating', icon: Star },
    { number: '24/7', label: 'Support', icon: Shield }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your financial data is protected with bank-level encryption and advanced security measures.'
    },
    {
      icon: Heart,
      title: 'User-Centered',
      description: 'Every feature is designed with your needs in mind, making financial management simple and intuitive.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'We help you build better financial habits and achieve your long-term financial goals.'
    },
    {
      icon: Globe,
      title: 'Accessible',
      description: 'Available across all devices with seamless synchronization and offline capabilities.'
    }
  ];


  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'Started with a vision to democratize financial management' },
    { year: '2021', title: '10K Users', description: 'Reached our first major user milestone' },
    { year: '2022', title: 'AI Integration', description: 'Launched intelligent financial assistant' },
    { year: '2023', title: 'Series A Funding', description: 'Secured $5M to accelerate growth' },
    { year: '2024', title: '50K+ Users', description: 'Trusted by thousands worldwide' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Money Manager</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering individuals and families to take control of their financial future through 
              intelligent, secure, and user-friendly money management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Get Started Today
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
              To make financial wellness accessible to everyone by providing innovative tools 
              that simplify money management, promote healthy spending habits, and help achieve financial goals.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-200">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Simplify</h3>
                <p className="opacity-90">Make complex financial concepts easy to understand and act upon.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-200">
                <Lock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Secure</h3>
                <p className="opacity-90">Protect your financial data with enterprise-grade security measures.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-200">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Empower</h3>
                <p className="opacity-90">Give you the insights and tools needed to make informed financial decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Money Manager
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones in our mission to transform personal finance
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 to-purple-600 hidden md:block"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:pr-8">
                    <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 ${index % 2 === 1 ? 'md:pl-8' : ''}`}>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full relative z-10"></div>
                  <div className="flex-1 md:pl-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their finances with Money Manager.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;