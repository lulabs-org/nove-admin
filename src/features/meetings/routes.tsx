/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-09 21:33:13
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 21:33:14
 * @FilePath: /nove-admin/src/features/meetings/routes.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { RouteConfig } from '../../shared/types/index';
import { Outlet } from 'react-router-dom';
import { MeetingList } from './pages/MeetingList';
import { MeetingDetail } from './pages/MeetingDetail';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { CalendarOutlined, UnorderedListOutlined } from '@ant-design/icons';

export const meetingRoutes: RouteConfig[] = [
  {
    path: '/meetings',
    element: <Outlet />,
    title: '会议管理',
    menu: true,
    permission: PERMISSIONS.MEETING.READ,
    icon: <CalendarOutlined />,
    children: [
      {
        path: '/meetings/list',
        element: <MeetingList />,
        title: '会议列表',
        menu: true,
        permission: PERMISSIONS.MEETING.READ,
        icon: <UnorderedListOutlined />,
      },
      {
        path: '/meetings/:id',
        element: <MeetingDetail />,
        title: '会议详情',
        menu: false,
        permission: PERMISSIONS.MEETING.READ,
      },
    ],
  },
];
