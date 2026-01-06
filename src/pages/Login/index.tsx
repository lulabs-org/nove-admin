import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/auth';
import './styles.css';

const { Title, Text } = Typography;

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: LoginRequest) => {
    setError(null);
    
    try {
      await login(values);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      // Display error message
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>nove Admin</Title>
          <Text type="secondary">
            Personalized Intelligent Education Platform
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { whitespace: true, message: 'Username cannot be empty' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { whitespace: true, message: 'Password cannot be empty' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
