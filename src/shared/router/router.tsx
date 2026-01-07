import type { RouteConfig } from './types';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { PublicLayout } from '../components/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

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
      route.element = <Navigate to={config.redirect} replace />;
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
        <PublicRoute>
          <PublicLayout>
            <Outlet />
          </PublicLayout>
        </PublicRoute>
      ),
      children: generateRoutes(publicRoutes),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AdminLayout routes={adminRoutes}>
            <Outlet />
          </AdminLayout>
        </ProtectedRoute>
      ),
      children: generateRoutes(adminRoutes),
    },
  ];
  return createBrowserRouter(routes);
}
