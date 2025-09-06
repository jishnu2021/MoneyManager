import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, Upload, Trash2, Eye, EyeOff, TrendingUp, DollarSign, Calendar, Settings, Save, Edit3, Shield, Activity } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    joinDate: '',
    profileImage: null
  });

  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyBudget: 0,
    savingsRate: 0,
    categoriesUsed: 0,
    transactionsCount: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [budgetInput, setBudgetInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Base URL - adjust based on your backend
  const API_BASE = 'http://localhost:3000/api';
  
  // Get auth token from localStorage (adjust based on your auth implementation)
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API Headers with authentication
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  // GET /profile - Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/profile`, {
        method:'GET',
        headers: getHeaders()
      });
      console.log("the response",response);
      
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // GET /stats - Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
        setBudgetInput(statsData.monthlyBudget.toString());
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // PUT /update - Update user profile
  const handleUpdateProfile = async (e:any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/update`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: user.username,
          bio: user.bio,
          location: user.location
        })
      });
      
      if (response.ok) {
        setIsEditing(false);
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // PUT /budget - Update user budget
  const handleUpdateBudget = async () => {
    try {
      const budgetValue = parseFloat(budgetInput);
      if (isNaN(budgetValue) || budgetValue < 0) {
        alert('Please enter a valid budget amount');
        return;
      }

      const response = await fetch(`${API_BASE}/budget`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ budget: budgetValue })
      });
      console.log("the update bugdegt",response)
      if (response.ok) {
        setStats(prev => ({ ...prev, monthlyBudget: budgetValue }));
        console.log('Budget updated successfully');
      } else {
        console.error('Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  // POST /upload-image - Upload profile image
  const handleImageUpload = async (event:any) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setUser(prev => ({ ...prev, profileImage: result.imageUrl }));
        console.log('Image uploaded successfully');
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // DELETE /delete-image - Delete profile image
  const handleDeleteImage = async () => {
    try {
      const response = await fetch(`${API_BASE}/delete-image`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        setUser(prev => ({ ...prev, profileImage: null }));
        console.log('Image deleted successfully');
      } else {
        console.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // PUT /change-password - Change user password
  const handleChangePassword = async (e:any) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwords.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      
      if (response.ok) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        console.log('Password changed successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">


      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Upload/Delete buttons */}
                  <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      
                      {user.profileImage && (
                        <button
                          onClick={handleDeleteImage}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.username || 'Loading...'}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                {user.joinDate && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                  
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-red-600">${stats.totalExpenses?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Budget</span>
                  <span className="font-semibold text-green-600">${stats.monthlyBudget?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Savings Rate</span>
                  <span className="font-semibold text-blue-600">{stats.savingsRate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold">{stats.categoriesUsed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold">{stats.transactionsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-indigo-600" />
                Profile Information
              </h3>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={user.username}
                      onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={user.location}
                      onChange={(e) => setUser(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={user.bio}
                    onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-50"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                {isEditing && (
                  <div className="mt-6 flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Budget Management */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Budget Management
              </h3>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your monthly budget"
                  />
                </div>
                <button
                  onClick={handleUpdateBudget}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Update Budget
                </button>
              </div>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Change Password
                </h3>
                
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Shield className="h-4 w-4" />
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;