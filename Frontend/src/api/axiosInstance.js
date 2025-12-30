import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Store reference for logout action (will be set by App.jsx)
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Request interceptor - Add token to headers and cookies
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in Authorization header (backup)
      config.headers.Authorization = `Bearer ${token}`;
      
      // Set token as cookie
      document.cookie = `token=${token}; path=/; SameSite=Lax`;
      
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      console.log('   Token in cookie and header');
    } else {
      console.warn('⚠️ API Request without token:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - only logout for authentication errors
      if (error.response.status === 401) {
        const errorMessage = error.response.data?.message || '';
        const requestUrl = error.config?.url || 'unknown';
        const token = localStorage.getItem('token');
        
        // Store error details in sessionStorage for debugging
        const errorLog = {
          timestamp: new Date().toISOString(),
          url: requestUrl,
          message: errorMessage,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
        };
        sessionStorage.setItem('last401Error', JSON.stringify(errorLog));
        
        console.error('=== 401 ERROR DETAILS ===');
        console.error('URL:', requestUrl);
        console.error('Error Message:', errorMessage);
        console.error('Has Token:', !!token);
        console.error('Token Preview:', token ? token: 'none');
        console.error('========================');
        
        // Check if error message indicates token/auth issue
        const errorLower = errorMessage.toLowerCase();
        
        // Only logout for ACTUAL auth errors, not backend validation issues
        const isRealAuthError = (errorLower.includes('expired') ||
                                errorLower.includes('invalid token') ||
                                errorLower.includes('malformed') ||
                                errorLower.includes('no token provided') ||
                                errorLower.includes('please login')) &&
                               !errorLower.includes('validating');
        
        // Don't logout for backend validation errors - these are temporary backend issues
        if (errorLower.includes('validating') || errorLower.includes('went wrong')) {
          console.error('⚠️ Backend validation error - NOT logging out (backend issue)');
          return Promise.reject(error);
        }
        
        if (isRealAuthError) {
          console.error('⚠️ Auth error detected - initiating logout');
          
          // Clear storage and cookie
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
          
          // Call logout callback if available (updates Redux state)
          if (logoutCallback) {
            logoutCallback();
          }
          
          // Redirect to login (only if not already there)
          if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        } else {
          console.warn('⚠️ 401 but not auth-related error - NOT logging out');
        }
      }
      
      // Handle other errors
      const errorMessage = error.response.data?.message || 'Something went wrong';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Network error
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

export default axiosInstance;
