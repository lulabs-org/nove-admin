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
import { SettingOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { systemConfigRoutes } from '../system-config';

export const settingsRoutes: RouteConfig[] = [
  {
    path: '/settings',
    element: <Outlet />,
    title: '系统设置',
    menu: true,
    icon: <SettingOutlined />,
    children: [
      {
        path: '/settings/profile',
        element: <ProfilePage />,
        title: '个人资料',
        menu: true,
        icon: <UserOutlined />,
      },
      {
        path: '/settings/security',
        element: <div>Security</div>,
        title: '安全设置',
        menu: true,
        permission: 'system:config',
        icon: <SafetyOutlined />,
      },
      ...systemConfigRoutes,
    ],
  },
  {
    path: '/404',
    element: <div>Not Found</div>,
    title: '404',
    hidden: true,
  },
];
