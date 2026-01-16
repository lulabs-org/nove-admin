/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:12:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 13:11:22
 * @FilePath: /nove-admin/src/features/users/routes.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from '../../shared/types/index';
import { UserManagement } from './UserManagement';
import { UserOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';

export const userRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <Outlet />,
    title: '用户管理',
    menu: true,
    permission: 'user:read',
    icon: <TeamOutlined />,
    children: [
      {
        path: '/users/list',
        element: <UserManagement />,
        title: '用户列表',
        menu: true,
        permission: 'user:read',
        icon: <UserOutlined />,
      },
      {
        path: '/users/create',
        element: <UserManagement />,
        title: '创建用户',
        menu: true,
        permission: 'user:create',
        icon: <PlusOutlined />,
      },
    ],
  },
];
