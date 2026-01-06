/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:04:11
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:04:12
 * @FilePath: /nove-admin/src/features/dashboard/routes.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from '../../shared/router/types';

export const dashboardRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <div>Dashboard</div>,
    title: '首页',
    menu: true,
  },
];
