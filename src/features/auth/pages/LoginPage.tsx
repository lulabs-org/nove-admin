/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 10:29:11
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-24 09:58:23
 * @FilePath: /nove-admin/src/features/auth/pages/LoginPage.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import message from 'antd/es/message';
import Tabs from 'antd/es/tabs';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, useCountdown } from '../../../shared/hooks';
import { verificationControllerSend } from '../../../shared/lib/api/orval/business/auth';

const { Title, Text } = Typography;

export function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { login } = useAuth();
  const { countdown, start: startCountdown } = useCountdown();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [sendingCode, setSendingCode] = useState(false);

  const onFinish = async (values: { email: string; password?: string; code?: string }) => {
    setLoading(true);
    try {
      if (loginType === 'password') {
        await login({
          type: 'email_password',
          email: values.email,
          password: values.password,
          clientType: 'web',
        });
      } else {
        await login({
          type: 'email_code',
          email: values.email,
          code: values.code,
          clientType: 'web',
        });
      }
      message.success('登录成功');
      navigate('/');
    } catch {
      message.error('登录失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.warning('请先输入邮箱');
      return;
    }
    setSendingCode(true);
    try {
      await verificationControllerSend({
        target: email,
        type: 'login',
      });
      message.success('验证码已发送');
      startCountdown(60);
    } catch {
      message.error('验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-250px',
          right: '-100px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          bottom: '-200px',
          left: '-100px',
        }}
      />
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: 'none',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
            欢迎回来
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '8px', display: 'block' }}>
            登录到管理后台
          </Text>
        </div>
        <Form form={form} name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as 'password' | 'code')}
            centered
            style={{ marginBottom: '24px' }}
            items={[
              {
                key: 'password',
                label: '密码登录',
              },
              {
                key: 'code',
                label: '验证码登录',
              },
            ]}
          />
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="邮箱"
              size="large"
              style={{
                borderRadius: '8px',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s',
              }}
            />
          </Form.Item>

          {loginType === 'password' ? (
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="密码"
                size="large"
                style={{
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  transition: 'all 0.3s',
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
              style={{ marginBottom: '24px' }}
            >
              <Input
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="验证码"
                size="large"
                suffix={
                  <Button
                    type="link"
                    onClick={handleSendCode}
                    loading={sendingCode}
                    disabled={countdown > 0}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                  </Button>
                }
                style={{
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  transition: 'all 0.3s',
                }}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
            © 2026 Admin Dashboard. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
}
