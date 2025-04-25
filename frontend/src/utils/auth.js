// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

// Token storage key
const TOKEN_KEY = 'chorely_auth_token';
const USER_DATA_KEY = 'chorely_user_data';

// Store authentication token
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get authentication token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Store user data
export const setUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

// Get user data
export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Clear authentication data
export const clearUserData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Check if token is valid
export const isAuthenticated = () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      clearUserData();
      return false;
    }
    
    return true;
  } catch (error) {
    clearUserData();
    return false;
  }
};

// Get user ID from token
export const getUserId = () => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};