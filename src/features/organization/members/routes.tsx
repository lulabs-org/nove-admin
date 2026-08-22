import type { RouteConfig } from '../../../shared/types';
import { OrgMemberManagement } from './OrgMemberManagement';
import { RoleManagement } from './RoleManagement';
import { PERMISSIONS } from '../../../shared/utils/permissions';

export const memberRoutes: RouteConfig[] = [
  {
    path: '/users/list',
    element: <OrgMemberManagement />,
    title: '成员部门',
    menu: true,
    permission: PERMISSIONS.USER.READ,
  },
  {
    path: '/users/roles',
    element: <RoleManagement />,
    title: '角色管理',
    menu: true,
    permission: PERMISSIONS.ROLE.READ,
  },
];
