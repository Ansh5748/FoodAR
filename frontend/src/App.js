import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import RestaurantSetup from './components/restaurant/RestaurantSetup';
import FoodItemManager from './components/food/FoodItemManager';
import ARViewer from './components/ar/ARViewer';
import QRGenerator from './components/qr/QRGenerator';
import Analytics from './components/analytics/Analytics';
import FoodLibrary from './components/library/FoodLibrary';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerFeedback from './components/feedback/CustomerFeedback';
import Settings from './components/settings/Settings';
import Profile from './components/settings/Profile';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Main App component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = (authData) => {
    setUser(authData.user);
    setToken(authData.access_token);
    localStorage.setItem('token', authData.access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`;
  };

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = (user) => {
    if (user?.role === 'super_admin') {
      return '/super-admin';
    } else if (user?.role === 'admin') {
      return '/admin';
    } else {
      return '/dashboard';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const authValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DishLook...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              user ? <Navigate to={getDashboardRoute(user)} /> : <Login />
            } />
            <Route path="/register" element={
              user ? <Navigate to={getDashboardRoute(user)} /> : <Register />
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/ar/:foodItemId" element={<ARViewer />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/super-admin" element={
              user?.role === 'super_admin' ? <SuperAdminDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/admin" element={
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/restaurant-setup" element={
              user ? <RestaurantSetup /> : <Navigate to="/login" />
            } />
            <Route path="/restaurant/:restaurantId/food-items" element={
              user ? <FoodItemManager /> : <Navigate to="/login" />
            } />
            <Route path="/restaurant/:restaurantId/qr-codes" element={
              user ? <QRGenerator /> : <Navigate to="/login" />
            } />
            <Route path="/restaurant/:restaurantId/analytics" element={
              user ? <Analytics /> : <Navigate to="/login" />
            } />
            <Route path="/food-library" element={
              user ? <FoodLibrary /> : <Navigate to="/login" />
            } />
            <Route path="/customer-feedback" element={
              user ? <CustomerFeedback /> : <Navigate to="/login" />
            } />
            <Route path="/customer-feedback/:restaurantId" element={
              user ? <CustomerFeedback /> : <Navigate to="/login" />
            } />
            <Route path="/settings" element={
              user ? <Settings /> : <Navigate to="/login" />
            } />
            <Route path="/profile" element={
              user ? <Profile /> : <Navigate to="/login" />
            } />
            
            {/* Default redirect */}
            <Route path="/" element={
              <Navigate to={user ? getDashboardRoute(user) : "/login"} />
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;