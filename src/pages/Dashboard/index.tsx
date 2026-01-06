import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

const { Title, Paragraph } = Typography;

/**
 * Dashboard homepage component
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="welcome-section">
          <Title level={2}>Welcome back, {user?.username}!</Title>
          <Paragraph type="secondary">
            Here's what's happening with your nove education platform today.
          </Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Students"
                value={1234}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Courses"
                value={56}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Instructors"
                value={28}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Growth Rate"
                value={12.8}
                prefix={<RiseOutlined />}
                suffix="%"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card title="Recent Activity" bordered={false}>
              <Paragraph>
                This section will display recent activities and updates from the platform.
              </Paragraph>
              <Paragraph type="secondary">
                • Student enrollment updates<br />
                • Course completions<br />
                • Instructor assignments<br />
                • System notifications
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Quick Actions" bordered={false}>
              <Paragraph>
                Common administrative tasks:
              </Paragraph>
              <Paragraph type="secondary">
                • Add new student<br />
                • Create course<br />
                • Assign instructor<br />
                • Generate report
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
