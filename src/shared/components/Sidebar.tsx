/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:21
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 06:51:19
 * @FilePath: /nove-admin/src/shared/components/Sidebar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Menu } from 'antd';
import type { RouteConfig } from '../router/types';
import { useLocation, useNavigate } from 'react-router-dom';

interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface SidebarProps {
  routes: RouteConfig[];
}

export function Sidebar({ routes }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = generateMenuItems(routes);
  const selectedKeys = [location.pathname];

  function generateMenuItems(routes: RouteConfig[]): MenuItem[] {
    return routes
      .filter((route) => route.menu && !route.hidden)
      .map((route) => {
        const item: MenuItem = {
          key: route.path,
          label: route.title,
          icon: route.icon,
        };

        if (route.children && route.children.length > 0) {
          item.children = generateMenuItems(route.children);
        }

        return item;
      });
  }

  function handleMenuClick({ key }: { key: string }) {
    navigate(key);
  }

  function renderMenuItems(items: MenuItem[]): React.ReactNode {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.label}
        </Menu.Item>
      );
    });
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    >
      {renderMenuItems(menuItems)}
    </Menu>
  );
}
