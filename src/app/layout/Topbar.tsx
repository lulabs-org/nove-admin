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

export function Topbar() {
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
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
          <span>{user?.name || user?.email || 'Admin'}</span>
        </Space>
      </Dropdown>
    </Header>
  );
}
