import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Dashboard sidebar navigation component
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: 'Students',
      onClick: () => navigate('/students'),
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: 'Courses',
      onClick: () => navigate('/courses'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      className="dashboard-sider"
    >
      <div className="logo">
        <h1>{collapsed ? 'N' : 'nove'}</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
