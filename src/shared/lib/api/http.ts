/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:29:39
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-24 09:09:58
 * @FilePath: /nove_project/nove-admin/src/shared/lib/api/http.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import axios from 'axios';
import { message } from 'antd';
import { authService } from '../../../features/auth/api/service';
import { useAuthStore } from '../../../features/auth/model/authStore';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

http.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['x-request-id'] = crypto.randomUUID();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(http(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
          { clientType: 'web' },
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        authService.setToken(accessToken);

        onTokenRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      message.error('您没有权限执行此操作');
    }

    if (error.response?.status >= 500) {
      message.error('服务器错误，请稍后重试');
      console.error('[Server Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        requestId: error.config?.headers?.['x-request-id'],
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);
