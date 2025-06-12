import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5500/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - runs before each request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs after each response
api.interceptors.response.use(
  (response) => {
    // Return just the data part of the response
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/sign-in', credentials),
  logout: () => api.post('/auth/sign-out'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Users API endpoints
export const usersAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  getUsers: () => api.get('/user'),
  createUser: (userData) => api.post('/user', userData),
  updateUser: (id, userData) => api.put(`/user/${id}`, userData),
  deleteUser: (id) => api.delete(`/user/${id}`),
};

// Export the api instance for direct use if needed
export default api;
