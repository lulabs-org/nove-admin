import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { routes } from './index';

describe('application routes', () => {
  it.each([
    {
      path: '/user-group',
      title: '用户管理',
      childPaths: ['/user-management', '/platform-users'],
    },
    {
      path: '/users',
      title: '组织架构',
      childPaths: ['/users/list', '/users/roles'],
    },
    {
      path: '/order-management',
      title: '订单管理',
      childPaths: ['/orders', '/order-refunds'],
    },
    {
      path: '/settings',
      title: '系统设置',
      childPaths: ['/settings/profile', '/settings/security', '/settings/system-config'],
    },
  ])('composes $title routes in the application layer', ({ path, title, childPaths }) => {
    const moduleRoute = routes.find((route) => route.path === path);

    expect(moduleRoute).toMatchObject({
      title,
      menu: true,
    });
    expect(moduleRoute?.children?.map((route) => route.path)).toEqual(childPaths);
  });

  it('preserves order child permissions', () => {
    const orderRoutes = routes.find((route) => route.path === '/order-management')?.children;

    expect(orderRoutes).toMatchObject([
      { permission: PERMISSIONS.ORDER.READ },
      { permission: PERMISSIONS.ORDER_REFUND.READ },
    ]);
  });
});
