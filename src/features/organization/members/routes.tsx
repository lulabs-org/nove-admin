import type { RouteConfig } from '../../../shared/types';
import { OrgMemberManagement } from './OrgMemberManagement';
import { RoleManagement } from './RoleManagement';

export const memberRoutes: RouteConfig[] = [
  {
    path: '/users/list',
    element: <OrgMemberManagement />,
    title: '成员部门',
    menu: true,
    permission: 'user:read',
  },
  {
    path: '/users/roles',
    element: <RoleManagement />,
    title: '角色管理',
    menu: true,
    permission: 'role:read',
  },
];
