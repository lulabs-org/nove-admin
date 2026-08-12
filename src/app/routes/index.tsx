/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 13:18:53
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 21:34:00
 * @FilePath: /nove-admin/src/app/routes/index.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import type { RouteConfig } from '../../shared/types';
import { dashboardRoutes } from '../../features/dashboard/routes';
import { orgMemberRoutes } from '../../features/org-members/routes';
import { platformUserRoutes } from '../../features/platform-users/routes';
import { permissionRoutes } from '../../features/permissions';
import { apiKeyRoutes } from '../../features/api-keys/routes';
import { settingsRoutes } from '../../features/settings/routes';
import { authRoutes } from '../../features/auth/routes';
import { meetingRoutes } from '../../features/meetings/routes';
import { taskRoutes } from '../../features/tasks/routes';
import { orderRoutes } from '../../features/orders/routes';
import { userRoutes } from '../../features/users/routes';
import { productRoutes } from '../../features/products/routes';

export const routes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...userRoutes,
  ...orgMemberRoutes,
  ...platformUserRoutes,
  ...permissionRoutes,
  ...apiKeyRoutes,
  ...productRoutes,
  ...orderRoutes,
  ...meetingRoutes,
  ...taskRoutes,
  ...settingsRoutes,
];
