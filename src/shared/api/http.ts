/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:29:39
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:29:46
 * @FilePath: /nove-admin/src/shared/api/http.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 请求拦截：注入 token / request-id
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['x-request-id'] = crypto.randomUUID();
  return config;
});

// 响应拦截：统一错误处理
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: 触发登出 / refresh token
    }
    return Promise.reject(error);
  }
);
