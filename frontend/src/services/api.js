import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ameenalsharafi.pythonanywhere.com/api' || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          console.error('Unauthorized');
          // Redirect to login or show auth modal
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Trip API calls
export const tripAPI = {
  // Create new trip and generate ELD logs
  createTrip: (tripData) => api.post('/trip/', tripData),
  
  // Get trip history
  getTripHistory: () => api.get('/trips/history/'),
  
  // Get specific trip by ID
  getTripById: (tripId) => api.get(`/trip/${tripId}/`),
  
  // Download ELD logs as PDF
  downloadPDF: (tripId) => api.get(`/trip/${tripId}/pdf/`, {
    responseType: 'blob',
  }),
  
  // Export trip data
  exportData: (tripId, format) => api.get(`/trip/${tripId}/export/`, {
    params: { format },
    responseType: 'blob',
  }),
};

// HOS Regulations API
export const hosAPI = {
  // Get HOS regulations reference
  getRegulations: () => api.get('/hos/regulations/'),
  
  // Check compliance for given hours
  checkCompliance: (hoursData) => api.post('/hos/check-compliance/', hoursData),
  
  // Get exceptions list
  getExceptions: () => api.get('/hos/exceptions/'),
  
  // Calculate available hours
  calculateAvailableHours: (currentCycle) => 
    api.post('/hos/calculate-available/', { current_cycle: currentCycle }),
};

// Utility functions
export const formatAPIError = (error) => {
  if (error.response && error.response.data) {
    const { data } = error.response;
    
    if (typeof data === 'object') {
      if (data.details) {
        return data.details;
      }
      if (data.error) {
        return data.error;
      }
      // Handle Django REST Framework validation errors
      if (data.non_field_errors) {
        return data.non_field_errors.join(', ');
      }
      // Combine field errors
      const fieldErrors = Object.entries(data)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      
      return fieldErrors || 'Validation error';
    }
    
    return String(data);
  }
  
  return error.message || 'An unknown error occurred';
};

export default api;
