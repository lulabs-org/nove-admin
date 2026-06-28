import type { RouteConfig } from '../../shared/types/index';
import { IntegrationsManagement } from './IntegrationsManagement';
import { ApiOutlined } from '@ant-design/icons';

export const integrationsRoutes: RouteConfig[] = [
  {
    path: '/integrations',
    element: <IntegrationsManagement />,
    title: '集成中心',
    menu: true,
    permission: 'system:config',
    icon: <ApiOutlined />,
  },
];
