/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:29:39
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 13:37:17
 * @FilePath: /nove-admin/src/shared/lib/api/http.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import axios from 'axios';
import { message } from 'antd';
import { authService } from '../../../features/auth/api/service';

const REFRESH_TOKEN_KEY = 'refresh_token';

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
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        authService.setToken(access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        onTokenRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return http(originalRequest);
      } catch (refreshError) {
        authService.clear();
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
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
