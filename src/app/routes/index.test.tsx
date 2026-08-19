import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { routes } from './index';

describe('application routes', () => {
  it.each([
    {
      path: '/organization',
      title: '组织架构',
      childPaths: ['/users/list', '/users/roles', '/user-management', '/platform-users'],
    },
    {
      path: '/transactions',
      title: '交易管理',
      childPaths: ['/products', '/channels', '/orders', '/order-refunds'],
    },
    {
      path: '/governance',
      title: '平台治理',
      childPaths: ['/permissions', '/api-keys', '/settings/system-config'],
    },
    {
      path: '/settings',
      title: '企业设置',
      childPaths: ['/settings/organization'],
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
    const orderRoutes = routes.find((route) => route.path === '/transactions')?.children?.slice(-2);

    expect(orderRoutes).toMatchObject([
      { permission: PERMISSIONS.ORDER.READ },
      { permission: PERMISSIONS.ORDER_REFUND.READ },
    ]);
  });
});
