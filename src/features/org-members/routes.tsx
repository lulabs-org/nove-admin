/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:12:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 13:11:22
 * @FilePath: /nove-admin/src/features/org-members/routes.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from '../../shared/types/index';
import { OrgMemberManagement } from './OrgMemberManagement';
import { TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';

export const orgMemberRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <Outlet />,
    title: '组织架构',
    menu: true,
    permission: 'user:read',
    icon: <TeamOutlined />,
    children: [
      {
        path: '/users/list',
        element: <OrgMemberManagement />,
        title: '成员与部门',
        menu: true,
        permission: 'user:read',
        icon: <UsergroupAddOutlined />,
      },
    ],
  },
];
