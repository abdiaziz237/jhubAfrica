import axios from 'axios';
import config from '../config';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      localStorage.removeItem('jhub_token');
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden');
      // Could redirect to unauthorized page
    }

    // Handle 500 Server errors
    if (error.response?.status >= 500) {
      console.error('Server error occurred');
      // Could show server error notification
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // Courses
  COURSES: {
    LIST: '/courses',
    DETAIL: (id) => `/courses/${id}`,
    ENROLL: (id) => `/courses/${id}/enroll`,
    UNENROLL: (id) => `/courses/${id}/unenroll`,
    JOIN_WAITLIST: (id) => `/courses/${id}/waitlist`,
    LEAVE_WAITLIST: (id) => `/courses/${id}/waitlist`,
    WAITLIST_STATUS: (id) => `/courses/${id}/waitlist`,
    WAITLISTED_COURSES: '/courses/waitlisted',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    ANALYTICS: '/admin/dashboard/analytics',
    USER_MANAGEMENT: '/admin/users',
    COURSE_MANAGEMENT: '/admin/courses',
    WAITLIST_MANAGEMENT: (courseId) => `/admin/courses/${courseId}/waitlist`,
    START_COHORT: (courseId) => `/admin/courses/${courseId}/start-cohort`,
    COMPLETE_COHORT: (courseId) => `/admin/courses/${courseId}/complete-cohort`,
    OPEN_COHORT: (courseId) => `/admin/courses/${courseId}/open-cohort`,
    UPDATE_COHORT_SETTINGS: (courseId) => `/admin/courses/${courseId}/cohort-settings`,
  },
  
  // Dashboard
  DASHBOARD: {
    USER_ACTIVITY: '/dashboard/user/activity',
    USER_ANALYTICS: '/dashboard/user/analytics',
  },
  
  // Course Interest
  COURSE_INTEREST: {
    SUBMIT: '/course-interest',
  },
};

// API methods
export const api = {
  // GET request
  get: (url, config = {}) => axiosInstance.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  
  // File upload
  upload: (url, formData, config = {}) => {
    return axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
