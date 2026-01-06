/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:06:26
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 02:24:52
 * @FilePath: /nove-admin/src/services/api.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved. 
 */
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { StorageService } from '../utils/storage';
import type { ApiErrorResponse } from '../types/api';

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://118.178.234.94:3000',
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
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      headers: error.config?.headers,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      request: error.request ? 'Request made but no response received' : 'No request made'
    });

    // Network error
    if (!error.response) {
      message.error('Network error. Please check your connection.');
      return Promise.reject({
        message: 'Network error',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        originalError: error
      });
    }

    const { status, data } = error.response;

    // Handle different error status codes
    switch (status) {
      case 401: {
        // Unauthorized - clear auth and redirect to login
        StorageService.clear();
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
        break;
      }
      
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
        {
          const errorMessage = data?.error?.message || 'An error occurred';
          message.error(errorMessage);
        }
    }

    return Promise.reject({
      message: data?.error?.message || error.message,
      code: data?.error?.code || 'UNKNOWN_ERROR',
      statusCode: status,
      details: data?.error?.details,
      originalError: error
    });
  }
);

export default apiClient;
