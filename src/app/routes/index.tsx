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
import { authRoutes } from '../../features/auth/routes';
import { dashboardRoutes } from '../../features/dashboard/routes';
import { userGroupRoutes } from '../../features/user-group/routes';
import { orgMemberRoutes } from '../../features/org-members/routes';
import { permissionRoutes } from '../../features/permissions';
import { apiKeyRoutes } from '../../features/api-keys/routes';
import { productRoutes } from '../../features/products/routes';
import { channelRoutes } from '../../features/channels/routes';
import { orderRoutes } from '../../features/orders/routes';
import { orderRefundRoutes } from '../../features/order-refunds';
import { meetingRoutes } from '../../features/meetings/routes';
import { trackingReportRoutes } from '../../features/tracking-reports/routes';
import { taskRoutes } from '../../features/tasks/routes';
import { settingsRoutes } from '../../features/settings/routes';

export const routes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...userGroupRoutes,
  ...orgMemberRoutes,
  ...permissionRoutes,
  ...apiKeyRoutes,
  ...productRoutes,
  ...channelRoutes,
  ...orderRoutes,
  ...orderRefundRoutes,
  ...meetingRoutes,
  ...trackingReportRoutes,
  ...taskRoutes,
  ...settingsRoutes,
];
