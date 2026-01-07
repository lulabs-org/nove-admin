/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:21
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:21:36
 * @FilePath: /nove-admin/src/shared/components/Sidebar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Menu } from 'antd';
import type { RouteConfig } from '../../shared/types';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

interface SidebarProps {
  routes: RouteConfig[];
}

export function Sidebar({ routes }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = generateMenuItems(routes);
  const selectedKeys = [location.pathname];

  function generateMenuItems(routes: RouteConfig[]): MenuProps['items'] {
    return routes
      .filter((route) => route.menu && !route.hidden)
      .map((route) => {
        const item: NonNullable<MenuProps['items']>[number] = {
          key: route.path,
          label: route.title,
          icon: route.icon,
        };

        if (route.children && route.children.length > 0) {
          (item as { children?: MenuProps['items'] }).children = generateMenuItems(route.children);
        }

        return item;
      });
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleMenuClick}
      items={menuItems}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
