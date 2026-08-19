import { ShoppingCartOutlined } from '@ant-design/icons';
import type { RouteConfig } from '../../shared/types';
import { orderRoutes } from './orders';
import { orderRefundRoutes } from './order-refunds';

export const orderManagementRoutes: RouteConfig[] = [
  {
    path: '/order-management',
    element: <></>,
    menuOnly: true,
    title: '订单管理',
    menu: true,
    icon: <ShoppingCartOutlined />,
    children: [...orderRoutes, ...orderRefundRoutes],
  },
];
