/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:21
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-23 14:26:06
 * @FilePath: /nove-admin/src/app/layout/Sidebar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import Menu from 'antd/es/menu';
import type { RouteConfig } from '../../shared/types';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd/es/menu';
import { useAuth } from '../../shared/hooks/useAuth';
import { useState } from 'react';

interface SidebarProps {
  routes: RouteConfig[];
  collapsed?: boolean;
}

function findActiveParentKeys(
  routes: RouteConfig[],
  pathname: string,
  parentKeys: string[] = []
): string[] {
  for (const route of routes) {
    if (route.path === pathname) return parentKeys;
    if (route.children?.length) {
      const childKeys = findActiveParentKeys(route.children, pathname, [...parentKeys, route.path]);
      if (childKeys.length) return childKeys;
    }
  }

  return [];
}

export function Sidebar({ routes, collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkPermission } = useAuth();

  const menuItems = generateMenuItems(routes);
  const selectedKeys = [location.pathname];
  const activeParentKeys = findActiveParentKeys(routes, location.pathname);
  const [manualOpenKeys, setManualOpenKeys] = useState<string[]>([]);
  const openKeys = Array.from(new Set([...manualOpenKeys, ...activeParentKeys]));

  function generateMenuItems(routes: RouteConfig[]): MenuProps['items'] {
    return routes
      .filter((route) => {
        if (!route.menu || route.hidden) return false;
        if (route.permission && !checkPermission(route.permission)) return false;
        return true;
      })
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
      openKeys={collapsed ? [] : openKeys}
      onOpenChange={setManualOpenKeys}
      onClick={handleMenuClick}
      items={menuItems}
      inlineCollapsed={collapsed}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
