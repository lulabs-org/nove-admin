/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:33:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 06:33:57
 * @FilePath: /nove-admin/src/shared/components/Layout.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Layout as AntLayout } from 'antd';
import type { RouteConfig } from '../../shared/types';
import { Sidebar } from './Sidebar';
import { PermissionGuard } from '../guards/PermissionGuard';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  routes: RouteConfig[];
  children: React.ReactNode;
}

export function Layout({ routes, children }: LayoutProps) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)' }} />
        <Sidebar routes={routes} />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <PermissionGuard>{children}</PermissionGuard>
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
