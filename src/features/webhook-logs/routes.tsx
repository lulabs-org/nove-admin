import type { RouteConfig } from '../../shared/types/index';
import { WebhookLogManagement } from './WebhookLogManagement';
import { ExceptionOutlined } from '@ant-design/icons';

export const webhookLogsRoutes: RouteConfig[] = [
  {
    path: '/webhook-logs',
    element: <WebhookLogManagement />,
    title: '日志大盘',
    menu: true,
    permission: 'system:config',
    icon: <ExceptionOutlined />,
  },
];
