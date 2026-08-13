import type { RouteConfig } from '../../shared/types/index';
import { Outlet } from 'react-router-dom';
import { TrackingReportList } from './pages/TrackingReportList';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { FileTextOutlined, UnorderedListOutlined } from '@ant-design/icons';

export const trackingReportRoutes: RouteConfig[] = [
  {
    path: '/tracking-reports',
    element: <Outlet />,
    title: '追踪报告',
    menu: true,
    permission: PERMISSIONS.TRACKING_REPORT.READ,
    icon: <FileTextOutlined />,
    children: [
      {
        path: '/tracking-reports/list',
        element: <TrackingReportList />,
        title: '报告列表',
        menu: true,
        permission: PERMISSIONS.TRACKING_REPORT.READ,
        icon: <UnorderedListOutlined />,
      },
    ],
  },
];
