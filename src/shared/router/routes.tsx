import type { RouteConfig } from './types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <div>Dashboard</div>,
    title: '首页',
    menu: true,
  },
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
  {
    path: '/settings',
    element: <div>Settings</div>,
    title: '系统设置',
    menu: true,
    permission: 'settings:view',
    children: [
      {
        path: '/settings/profile',
        element: <div>Profile</div>,
        title: '个人资料',
        menu: true,
      },
      {
        path: '/settings/security',
        element: <div>Security</div>,
        title: '安全设置',
        menu: true,
        permission: 'settings:security',
      },
    ],
  },
  {
    path: '/404',
    element: <div>Not Found</div>,
    title: '404',
    hidden: true,
  },
];
