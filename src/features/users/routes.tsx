import type { RouteConfig } from '../../shared/router/types';

export const userRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <div>Users</div>,
    title: '用户管理',
    menu: true,
    permission: 'users:view',
    children: [
      {
        path: '/users/list',
        element: <div>User List</div>,
        title: '用户列表',
        menu: true,
        permission: 'users:list',
      },
      {
        path: '/users/create',
        element: <div>Create User</div>,
        title: '创建用户',
        menu: true,
        permission: 'users:create',
      },
    ],
  },
];
