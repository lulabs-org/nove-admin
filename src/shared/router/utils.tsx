/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:32:49
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 06:34:03
 * @FilePath: /nove-admin/src/shared/router/utils.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from './types';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

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

export function createAppRouter(routeConfigs: RouteConfig[], layoutElement: React.ReactElement) {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: layoutElement,
      children: generateRoutes(routeConfigs),
    },
  ];
  return createBrowserRouter(routes);
}
