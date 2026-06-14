import type { RouteConfig } from '../../shared/types/index';
import { TaskManagement } from './pages/TaskManagement';
import { ScheduleOutlined } from '@ant-design/icons';

export const taskRoutes: RouteConfig[] = [
  {
    path: '/tasks',
    element: <TaskManagement />,
    title: '任务管理',
    menu: true,
    icon: <ScheduleOutlined />,
  },
];
