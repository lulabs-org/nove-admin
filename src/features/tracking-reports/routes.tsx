import type { RouteConfig } from '../../shared/types/index';
import { TrackingReportList } from './pages/TrackingReportList';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { FileTextOutlined } from '@ant-design/icons';

export const trackingReportRoutes: RouteConfig[] = [
  {
    path: '/tracking-reports/list',
    element: <TrackingReportList />,
    title: '追踪报告',
    menu: true,
    permission: PERMISSIONS.TRACKING_REPORT.READ,
    icon: <FileTextOutlined />,
  },
];
