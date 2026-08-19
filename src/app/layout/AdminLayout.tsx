/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:14:19
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-23 20:38:26
 * @FilePath: /nove-admin/src/app/layout/AdminLayout.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Button, Divider, Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { RouteConfig } from '../../shared/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const { Content, Sider } = Layout;
const MOBILE_SIDER_QUERY = '(max-width: 760px)';

interface AdminLayoutProps {
  routes: RouteConfig[];
  children?: React.ReactNode;
}

export function AdminLayout({ routes, children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_SIDER_QUERY).matches;
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{
          borderRight: '1px solid #f0f0f0',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 101,
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            {collapsed ? 'Nove' : 'Nove System'}
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            <Sidebar routes={routes} collapsed={collapsed} />
          </div>
          <div style={{ padding: '8px 12px 16px' }}>
            <Divider style={{ margin: '0 0 8px' }} />
            <Button
              type="text"
              block
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              onMouseDown={(event) => event.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0 8px' : '0 12px',
                height: 40,
                boxShadow: 'none',
                outline: 'none',
              }}
            >
              {collapsed ? null : '收起导航'}
            </Button>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240 }}>
        <Topbar />
        <Content style={{ margin: '12px', marginTop: '76px', overflow: 'auto' }}>
          <div style={{ padding: 24, height: '100%', background: '#fff', borderRadius: 8 }}>
            {children || <Outlet />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
