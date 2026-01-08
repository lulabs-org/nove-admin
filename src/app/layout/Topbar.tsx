/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:27:09
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 05:23:28
 * @FilePath: /nove-admin/src/app/layout/Topbar.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { Layout } from 'antd';
import Dropdown from 'antd/es/dropdown';
import Avatar from 'antd/es/avatar';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Tooltip from 'antd/es/tooltip';
import Button from 'antd/es/button';
import Badge from 'antd/es/badge';
import { UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../shared/hooks/useAuth';
import { layoutStyles, layoutTokens } from './layoutTheme';

const { Header } = Layout;
const { Search } = Input;

export function Topbar() {
  const { user, logout } = useAuth();
  const displayName = user?.profile?.name || user?.email || 'Admin';
  const roleName = user?.roles?.[0] || 'User';

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
    <Header style={layoutStyles.topbar}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: layoutTokens.textMuted }}>Hi, {displayName}</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>保持高效的一天</div>
      </div>
      <Search placeholder="搜索功能、页面或操作" allowClear style={{ maxWidth: 320 }} />
      <div style={layoutStyles.topbarActions}>
        <Tooltip title="通知中心">
          <Badge dot>
            <Button type="text" shape="circle" icon={<BellOutlined />} />
          </Badge>
        </Tooltip>
        <Tooltip title="偏好设置">
          <Button type="text" shape="circle" icon={<SettingOutlined />} />
        </Tooltip>
      </div>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }} size={12}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: layoutTokens.textMuted }}>{roleName}</div>
          </div>
          <Avatar icon={<UserOutlined />} />
        </Space>
      </Dropdown>
    </Header>
  );
}
