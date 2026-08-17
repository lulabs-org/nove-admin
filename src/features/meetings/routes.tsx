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
import { MeetingList } from './pages/MeetingList';
import { MeetingDetail } from './pages/MeetingDetail';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { CalendarOutlined } from '@ant-design/icons';

export const meetingRoutes: RouteConfig[] = [
  {
    path: '/meetings',
    element: <MeetingList />,
    title: '会议管理',
    menu: true,
    permission: PERMISSIONS.MEETING.READ,
    icon: <CalendarOutlined />,
  },
  {
    path: '/meetings/list',
    redirect: '/meetings',
    menu: false,
  },
  {
    path: '/meetings/:id',
    element: <MeetingDetail />,
    title: '会议详情',
    menu: false,
    permission: PERMISSIONS.MEETING.READ,
  },
];
