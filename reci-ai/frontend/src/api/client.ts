import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Remove trailing slash if present
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}

// Ensure it ends with /api/v1
export const API_URL = rawApiUrl.endsWith('/api/v1') 
  ? rawApiUrl 
  : `${rawApiUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Unified error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected connection error occurred';
    return Promise.reject(new Error(message));
  }
);
