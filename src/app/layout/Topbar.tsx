/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:27:09
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-23 20:40:06
 * @FilePath: /nove-admin/src/app/layout/Topbar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import Layout from 'antd/es/layout';
import Dropdown from 'antd/es/dropdown';
import Avatar from 'antd/es/avatar';
import Space from 'antd/es/space';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../shared/hooks/useAuth';

const { Header } = Layout;

interface TopbarProps {
  collapsed: boolean;
  sidebarWidth: number;
}

export function Topbar({ collapsed, sidebarWidth }: TopbarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await logout();
      },
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: sidebarWidth,
          flex: `0 0 ${sidebarWidth}px`,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 600,
          color: '#17233d',
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? 'Nove' : 'Nove System'}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '0 24px' }}>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
            <span>{user?.name || user?.email || 'Admin'}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
