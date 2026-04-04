// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Debug: Check initial state
console.log('[API] Initializing with base URL:', API_BASE_URL);
console.log('[API] Initial token:', localStorage.getItem('access_token') ? 'Exists' : 'Missing');

// Create axios instance with JWT token handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Debug logging
    console.log('[API Request Interceptor]', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 30)}...` : null,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Authorization header added');
    } else {
      console.warn('[API] No access token found in localStorage!');
      console.warn('[API] Available localStorage keys:', Object.keys(localStorage));
      
      // Don't redirect here - let the component handle it
      // This prevents infinite redirect loops
    }
    
    // Debug final headers (excluding full token for security)
    console.log('[API] Final headers:', {
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer ***' : 'Missing'
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Interceptor Error]', error);
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url?.includes('send_sms')) {
      console.log('[API SMS Success]', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] Token expired, attempting refresh...');
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('[API] Refreshing token...');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        console.log('[API] Token refreshed successfully');
        
        // Save new token
        localStorage.setItem('access_token', newAccessToken);
        
        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('[API] Retrying original request with new token');
        
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('[API] Token refresh failed:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          console.log('[API] Redirecting to login...');
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }
    
    if (error.response?.status === 400) {
      // Handle field-specific errors
      const data = error.response.data;
      if (data && typeof data === 'object') {
        const firstError = Object.values(data).flat()[0];
        if (firstError) return Promise.reject(new Error(String(firstError)));
      }
      const errorMsg = data?.detail || data?.error || 'Bad request';
      return Promise.reject(new Error(errorMsg));
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please check your connection.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    return Promise.reject(error);
  }
);

// ===== API FUNCTIONS =====

// Auth API
export const authAPI = {
  // Get JWT tokens
  getToken: (username: string, password: string) => 
    api.post('/auth/token/', { username, password }),
  
  // Refresh token
  refreshToken: (refresh: string) => 
    api.post('/auth/token/refresh/', { refresh }),
  
  // Verify token
  verifyToken: (token: string) => 
    api.post('/auth/token/verify/', { token }),
  
  // Get current user
  getCurrentUser: () => 
    api.get('/users/me/'),
};

// Students API
export const studentsAPI = {
  getAll: (params?: any) => 
    api.get('/students/', { params }),
  
  getById: (id: number) => 
    api.get(`/students/${id}/`),
  
  create: (data: any) => 
    api.post('/students/', data),
  
  update: (id: number, data: any) => 
    api.put(`/students/${id}/`, data),
  
  partialUpdate: (id: number, data: any) => 
    api.patch(`/students/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/students/${id}/`),
  
  // Student actions
  approve: (id: number) => 
    api.put(`/students/${id}/approve/`),
  
  reject: (id: number, reason: string) => 
    api.put(`/students/${id}/reject/`, { reason }),
  
  // SMS operations - FIXED: Ensure POST method
  sendSMS: (id: number, message?: string) => {
    const data = message ? { message } : {};
    console.log('[SMS API] Sending SMS to student:', id, 'Message:', message);
    return api.post(`/students/${id}/send_sms/`, data);
  },
  
  bulkSendSMS: (studentIds: number[], message?: string) => {
    const data: any = { student_ids: studentIds };
    if (message) data.message = message;
    return api.post('/students/bulk_send_sms/', data);
  },
  
  bulkApprove: (studentIds: number[]) =>
    api.post('/students/bulk_approve/', { student_ids: studentIds }),
  
  testSMS: (phone: string, message: string) => 
    api.post('/students/test_sms/', { phone, message }),
  
  getSMSBalance: () => 
    api.get('/students/sms_balance/'),
  
  export: () => 
    api.get('/students/export/', { responseType: 'blob' }),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => 
    api.get('/users/', { params }),
  
  getById: (id: number) => 
    api.get(`/users/${id}/`),
  
  getMe: () => 
    api.get('/users/me/'),
  
  create: (data: any) => 
    api.post('/users/', data),
  
  update: (id: number, data: any) => 
    api.put(`/users/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/users/${id}/`),
};

// Bursaries API
export const bursariesAPI = {
  getBudgetOverview: () => api.get('/bursaries/budgets/overview/'),
  getWards: () => api.get('/bursaries/wards/'),
  getAllocations: () => api.get('/bursaries/allocations/'),
  createAllocation: (data: any) => api.post('/bursaries/allocations/', data),
  updateBudget: (id: number, data: any) => api.patch(`/bursaries/budgets/${id}/`, data),
};

// Export the instance
export { api };
export default api;