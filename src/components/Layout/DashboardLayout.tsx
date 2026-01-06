import React, { useState } from 'react';
import { Layout } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';
import './styles.css';

const { Content, Footer } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component with header, sidebar, content, and footer
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header collapsed={collapsed} onToggle={toggleSidebar} />
        <Content className="dashboard-content">
          <div className="content-wrapper">{children}</div>
        </Content>
        <Footer className="dashboard-footer">
          nove Admin ©{new Date().getFullYear()} - Personalized Intelligent Education Platform
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
