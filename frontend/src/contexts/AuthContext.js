// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../api/api';
import { 
  setToken, 
  setUserData, 
  getUserData, 
  clearUserData, 
  isAuthenticated as checkAuth 
} from '../utils/auth';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (checkAuth()) {
        try {
          // Get user data from local storage first for immediate rendering
          const storedUser = getUserData();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
          
          // Fetch fresh user data from API
          const { data } = await userService.getProfile();
          setUser(data);
          setUserData(data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user data:', error);
          setError('Session expired. Please login again.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const data = response.data;
      
      // Store token
      setToken(data.token);
      
      // Create user object from the response
      const userObj = {
        user_id: data.user_id,
        name: userData.name,
        email: userData.email
      };
      
      // Store user data
      setUserData(userObj);
      setUser(userObj);
      setIsAuthenticated(true);
      setError(null);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      const data = response.data;
      
      // Store token from login response
      setToken(data.token);
      
      // Store user data directly from login response
      const userObj = {
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        avatar_id: data.avatar_id
      };
      
      setUserData(userObj);
      setUser(userObj);
      setIsAuthenticated(true);
      setError(null);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Logout user
  const logout = () => {
    clearUserData();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { data } = await userService.updateProfile(userData);
      setUser(data);
      setUserData(data);
      setError(null);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset request failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await authService.resetPassword({ token, password });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};