// src/api/api.js
import axios from 'axios';
import { getToken, clearUserData } from '../utils/auth';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearUserData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => API.post('/auth/reset-password', resetData),
};

// User services
export const userService = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (userData) => API.put('/users/profile', userData),
};

// Home services
export const homeService = {
  createHome: (homeData) => API.post('/homes', homeData),
  getHomes: () => API.get('/homes'),
  getHomeById: (homeId) => API.get(`/homes/${homeId}`),
  addUserToHome: (homeId, userData) => API.post(`/homes/${homeId}/users`, userData),
  updateUserRole: (homeId, userId, roleData) => API.put(`/homes/${homeId}/users/${userId}`, roleData),
  getHomeUsers: (homeId) => API.get(`/homes/${homeId}/users`),
  removeUser: (homeId, userId) => API.delete(`/homes/${homeId}/users/${userId}`),
};

// Task services
export const taskService = {
  createTask: (taskData) => API.post('/tasks', taskData),
  getHomeTasks: (homeId) => API.get(`/tasks/home/${homeId}`),
  getAssignedTasks: () => API.get('/tasks/assigned'),
  getUnclaimedTasks: (homeId) => API.get(`/tasks/unclaimed/${homeId}`),
  getTasksByType: (homeId, taskType) => API.get(`/tasks/type/${taskType}/home/${homeId}`),
  assignTask: (assignData) => API.post('/tasks/assign', assignData),
  completeTask: (completionData) => API.put('/tasks/complete', completionData),
  getTaskById: (taskId) => API.get(`/tasks/${taskId}`),
  updateTask: (taskId, taskData) => API.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => API.delete(`/tasks/${taskId}`),
  // claimTask method that uses the existing assignTask endpoint
  claimTask: (taskId, userId) => API.post('/tasks/assign', { 
    task_id: taskId,
    assigned_user_id: userId
  }),
};

// Leaderboard services
export const leaderboardService = {
  getHomeLeaderboard: (homeId) => API.get(`/leaderboard/homes/${homeId}`),
  getUserStats: () => API.get('/leaderboard/user/stats'),
  getLowestScorers: (homeId) => API.get(`/leaderboard/homes/${homeId}/lowest-scorers`),
  getYearlySummary: (homeId) => API.get(`/leaderboard/homes/${homeId}/yearly-summary`),
};

// Template services
export const templateService = {
  getCategories: () => API.get('/templates/categories'),
  getTemplatesByCategory: (category) => API.get(`/templates/category/${category}`),
  getAllTemplates: () => API.get('/templates'),
  getTemplateById: (templateId) => API.get(`/templates/${templateId}`),
  createTaskFromTemplate: (templateId, taskData) => API.post(`/templates/${templateId}/create-task`, taskData),
};

// Chat services
export const chatService = {
  getHomeMessages: (homeId) => API.get(`/chat/homes/${homeId}`),
  sendMessage: (homeId, messageData) => API.post(`/chat/homes/${homeId}`, messageData),
  deleteMessage: (messageId) => API.delete(`/chat/${messageId}`),
};

// Break mode services
export const breakModeService = {
  toggleBreakMode: (homeId) => API.put(`/break-mode/homes/${homeId}/toggle-break`),
};

// Notification services
export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (notificationId) => API.put('/notifications/read', { notificationId }),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (notificationId) => API.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => API.get('/notifications/count'),
};

// Home join request services
export const homeRequestService = {
  searchHomes: (query) => API.get('/home-requests/search', { params: { query } }),
  requestToJoin: (homeId, requestData) => API.post(`/home-requests/${homeId}/request`, requestData),
  getMyRequests: () => API.get('/home-requests/my-requests'),
  cancelRequest: (requestId) => API.delete(`/home-requests/my-requests/${requestId}`),
  getPendingRequests: () => API.get('/home-requests/pending-requests'),
  handleRequest: (requestId, status) => API.put(`/home-requests/request/${requestId}`, { status }),
};

// File upload services
export const uploadService = {
  uploadImage: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return API.post('/uploads/images', formData, config);
  },
  uploadTaskImages: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return API.post('/uploads/task-images', formData, config);
  },
  getImageUrl: (filename) => `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/images/${filename}`,
};

export default API;