import type { RouteConfig } from '../../../shared/types';
import { RecordList } from './RecordList';

export const recordsRoutes: RouteConfig[] = [
  {
    path: '/profit-sharing/records',
    title: '分润流水',
    menu: true,
    element: <RecordList />,
  },
];
