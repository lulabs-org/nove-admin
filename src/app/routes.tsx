import type { RouteConfig } from '../shared/router/types';
import { dashboardRoutes } from '../features/dashboard/routes';
import { userRoutes } from '../features/users/routes';
import { settingsRoutes } from '../features/settings/routes';
import { authRoutes } from '../features/auth/routes';

export const routes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...userRoutes,
  ...settingsRoutes,
];
