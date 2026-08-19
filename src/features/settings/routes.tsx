/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:04:28
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 13:11:33
 * @FilePath: /nove-admin/src/features/settings/routes.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from '../../shared/types/index';
import { SettingOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { profileRoutes } from './profile';
import { securityRoutes } from './security';
import { systemConfigRoutes } from './system-config';

export const settingsModuleRoutes: RouteConfig[] = [
  {
    path: '/settings',
    element: <Outlet />,
    title: '系统设置',
    menu: true,
    icon: <SettingOutlined />,
    children: [...profileRoutes, ...securityRoutes, ...systemConfigRoutes],
  },
];
