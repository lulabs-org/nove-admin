/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:14:19
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 06:17:43
 * @FilePath: /nove-admin/src/app/layout/AdminLayout.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import type { RouteConfig } from '../../shared/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SidebarBrand } from './SidebarBrand';
import { SidebarTrigger } from './SidebarTrigger';
import { layoutStyles } from './layoutTheme';

const { Content, Sider } = Layout;

interface AdminLayoutProps {
  routes: RouteConfig[];
  children?: React.ReactNode;
}

export function AdminLayout({ routes, children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={layoutStyles.shell}>
      <Sider
        width={280}
        collapsedWidth={88}
        theme="light"
        style={layoutStyles.sidebar}
        collapsible
        trigger={null}
        collapsed={collapsed}
      >
        <SidebarBrand collapsed={collapsed} title="Admin Control" subtitle="更智能的运营工作台" />
        <SidebarTrigger collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        <Sidebar routes={routes} collapsed={collapsed} />
        {!collapsed && <div style={layoutStyles.sidebarFooter}>版本 1.0.0 · 稳定运行</div>}
      </Sider>
      <Layout style={layoutStyles.innerShell}>
        <Topbar />
        <Content style={{ ...layoutStyles.contentArea, marginTop: 24 }}>
          <div style={layoutStyles.contentCard}>{children || <Outlet />}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
