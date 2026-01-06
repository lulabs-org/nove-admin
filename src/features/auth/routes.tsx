import type { RouteConfig } from '../../shared/router/types';
import { LoginPage } from './LoginPage';

export const authRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: <LoginPage />,
    title: '登录',
    hidden: true,
  },
];
