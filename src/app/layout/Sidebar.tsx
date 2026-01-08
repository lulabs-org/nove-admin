/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:21
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 07:08:28
 * @FilePath: /nove-admin/src/app/layout/Sidebar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import Menu from 'antd/es/menu';
import type { RouteConfig } from '../../shared/types';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd/es/menu';
import { layoutStyles } from './layoutTheme';
import { AppstoreOutlined } from '@ant-design/icons';

interface SidebarProps {
  routes: RouteConfig[];
  collapsed?: boolean;
}

export function Sidebar({ routes, collapsed = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuData = useMemo(() => buildMenuData(routes, collapsed), [routes, collapsed]);
  const { items: menuItems, meta } = menuData;

  const selectedKeys = useMemo(() => {
    const activeKey = resolveActiveKey(location.pathname, Object.keys(meta));
    return activeKey ? [activeKey] : [];
  }, [location.pathname, meta]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys as string[]);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onClick={handleMenuClick}
      onOpenChange={handleOpenChange}
      items={menuItems}
      inlineCollapsed={collapsed}
      style={layoutStyles.menu}
    />
  );
}

type MenuMeta = Record<string, string[]>;

function buildMenuData(routes: RouteConfig[], collapsed: boolean) {
  const meta: MenuMeta = {};

  const buildItems = (nodes: RouteConfig[], parents: string[] = []): MenuProps['items'] =>
    nodes
      .filter((route) => route.menu && !route.hidden)
      .map((route) => {
        const key = route.path;
        meta[key] = parents;

        const children = route.children ? buildItems(route.children, [...parents, key]) : undefined;
        const hasChildren = children && children.length > 0;

        const item: NonNullable<MenuProps['items']>[number] = {
          key,
          label: route.title,
          icon: route.icon ?? (collapsed ? <AppstoreOutlined /> : undefined),
        };

        if (hasChildren) {
          (item as { children?: MenuProps['items'] }).children = children;
        }

        return item;
      });

  return { items: buildItems(routes), meta };
}

function resolveActiveKey(pathname: string, keys: string[]) {
  return keys
    .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];
}
