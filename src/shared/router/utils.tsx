/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:32:49
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:19:48
 * @FilePath: /nove-admin/src/shared/router/utils.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from './types';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { PublicLayout } from '../components/PublicLayout';

function createRedirectElement(to: string) {
  return <Navigate to={to} replace />;
}

export function generateRoutes(routeConfigs: RouteConfig[]): RouteObject[] {
  return routeConfigs.map((config) => {
    const route: RouteObject = {
      path: config.path,
      element: config.element,
    };

    if (config.children) {
      route.children = generateRoutes(config.children);
    }

    if (config.redirect) {
      route.element = createRedirectElement(config.redirect);
    }

    return route;
  });
}

export function createAppRouter(routeConfigs: RouteConfig[]) {
  const publicRoutes = routeConfigs.filter((route) => route.path === '/login');
  const adminRoutes = routeConfigs.filter((route) => route.path !== '/login');

  const routes: RouteObject[] = [
    {
      path: '/login',
      element: (
        <PublicLayout>
          <Outlet />
        </PublicLayout>
      ),
      children: generateRoutes(publicRoutes),
    },
    {
      path: '/',
      element: (
        <AdminLayout routes={adminRoutes}>
          <Outlet />
        </AdminLayout>
      ),
      children: generateRoutes(adminRoutes),
    },
  ];
  return createBrowserRouter(routes);
}
