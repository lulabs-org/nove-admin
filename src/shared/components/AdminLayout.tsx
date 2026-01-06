/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:14:19
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:14:21
 * @FilePath: /nove-admin/src/shared/components/AdminLayout.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import type { RouteConfig } from '../router/types';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

const { Content, Sider } = Layout;

interface AdminLayoutProps {
  routes: RouteConfig[];
  children?: React.ReactNode;
}

export function AdminLayout({ routes, children }: AdminLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          Admin System
        </div>
        <Sidebar routes={routes} />
      </Sider>
      <Layout>
        <Topbar />
        <Content style={{ margin: '24px', overflow: 'auto' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: 8 }}>
            {children || <Outlet />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
