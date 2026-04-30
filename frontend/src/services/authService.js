import axios from 'axios';
import { getToken } from '../utils/tokenUtils';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add Authorization header to all requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
};

export default apiClient;
