import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
import Typography from 'antd/es/typography';
import message from 'antd/es/message';
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/api';
import { useAuthStore } from '../../auth/model/authStore';

const { Text } = Typography;

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

function getApiMessage(error: unknown): string | undefined {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const apiMessage = error.response?.data?.message;
    if (Array.isArray(apiMessage)) return apiMessage.join('；');
    if (apiMessage) return apiMessage;
  }
  return undefined;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const resetState = () => {
    form.resetFields();
    setSubmitting(false);
    setDone(false);
  };

  const handleClose = () => {
    if (done) {
      resetState();
      clearAuth();
      navigate('/login');
      return;
    }
    resetState();
    onClose();
  };

  const onFinish = async (values: ChangePasswordFormValues) => {
    setSubmitting(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setDone(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMessage = getApiMessage(error);

        if (status === 429) {
          message.error('操作过于频繁，请稍后再试');
        } else if (status === 400 && apiMessage?.includes('当前密码错误')) {
          form.setFields([{ name: 'oldPassword', errors: ['当前密码错误'] }]);
        } else {
          message.error(apiMessage || '密码修改失败，请稍后重试');
        }
      } else {
        message.error('密码修改失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={handleClose}
      maskClosable={!submitting && !done}
      closable={!submitting}
      footer={null}
      destroyOnClose
    >
      {done ? (
        <div className="change-password-success">
          <CheckCircleOutlined className="change-password-success-icon" />
          <Typography.Title level={4}>密码修改成功</Typography.Title>
          <Text type="secondary">
            系统已向你的邮箱发送安全通知邮件。为安全起见，已退出所有设备，请重新登录。
          </Text>
          <div className="change-password-success-actions">
            <Button type="primary" onClick={handleClose}>
              重新登录
            </Button>
          </div>
        </div>
      ) : (
        <Form<ChangePasswordFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入当前密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码长度至少为8位' },
              {
                pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '密码必须包含大小写字母和数字',
              },
            ]}
            extra="要求：至少8位，包含大小写字母和数字"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="修改成功后将自动退出所有设备，需要使用新密码重新登录。"
            style={{ marginBottom: 16 }}
          />

          <div className="change-password-actions">
            <Button onClick={handleClose} disabled={submitting}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              确认修改
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
