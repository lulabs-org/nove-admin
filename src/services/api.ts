import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { StorageService } from '../utils/storage';
import type { ApiErrorResponse } from '../types/api';

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to inject authorization token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = StorageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Network error
    if (!error.response) {
      message.error('Network error. Please check your connection.');
      return Promise.reject({
        message: 'Network error',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    }

    const { status, data } = error.response;

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        StorageService.clear();
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        break;
      
      case 403:
        message.error('Access denied. Insufficient permissions.');
        break;
      
      case 404:
        message.error('Resource not found.');
        break;
      
      case 500:
      case 502:
      case 503:
        message.error('Server error. Please try again later.');
        break;
      
      default:
        // Display error message from API if available
        const errorMessage = data?.error?.message || 'An error occurred';
        message.error(errorMessage);
    }

    return Promise.reject({
      message: data?.error?.message || error.message,
      code: data?.error?.code || 'UNKNOWN_ERROR',
      statusCode: status,
      details: data?.error?.details,
    });
  }
);

export default apiClient;
