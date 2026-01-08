/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 06:17:49
 * @FilePath: /nove-admin/src/app/layout/Layout.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import type { RouteConfig } from '../../shared/types';
import { Sidebar } from './Sidebar';
import { PermissionGuard } from '../guards/PermissionGuard';
import { SidebarBrand } from './SidebarBrand';
import { SidebarTrigger } from './SidebarTrigger';
import { layoutStyles, layoutTokens } from './layoutTheme';

const { Header, Content, Sider } = AntLayout;

interface AppLayoutProps {
  routes: RouteConfig[];
  children: React.ReactNode;
}

export function Layout({ routes, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout style={layoutStyles.shell}>
      <Sider
        width={280}
        collapsedWidth={88}
        theme="light"
        style={layoutStyles.sidebar}
        collapsible
        trigger={null}
        collapsed={collapsed}
      >
        <SidebarBrand collapsed={collapsed} title="体验工作台" subtitle="快捷进入常用功能" />
        <SidebarTrigger collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        <Sidebar routes={routes} collapsed={collapsed} />
        {!collapsed && (
          <div style={layoutStyles.sidebarFooter}>随时掌控业务动态 · 数据随手可得</div>
        )}
      </Sider>
      <AntLayout style={layoutStyles.innerShell}>
        <Header style={layoutStyles.header}>
          <div>
            <div
              style={{ fontSize: 12, textTransform: 'uppercase', color: layoutTokens.textMuted }}
            >
              Overview
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>欢迎回来</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: layoutTokens.textMuted }}>今日概览</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: layoutTokens.accent }}>
              保持专注，持续迭代
            </div>
          </div>
        </Header>
        <Content style={layoutStyles.contentArea}>
          <div style={layoutStyles.contentCard}>
            <PermissionGuard>{children}</PermissionGuard>
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
