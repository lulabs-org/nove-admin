import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Dashboard header component
 */
const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="dashboard-header">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="trigger-btn"
        />
      </div>

      <div className="header-right">
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space className="user-info" style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text>{user?.username || 'User'}</Text>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
