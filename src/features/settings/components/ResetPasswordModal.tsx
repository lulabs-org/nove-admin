import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Result from 'antd/es/result';
import Typography from 'antd/es/typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../../shared/hooks';
import { useAuthStore } from '../../auth/model/authStore';
import { resetPassword, sendEmailCode } from '../api/passwordApi';

const { Text } = Typography;

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  // 保留前2位 + 后2位，中间用 * 脱敏
  if (local.length <= 4) return `${local[0]}***${local.at(-1)}${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(local.length - 4)}${local.slice(-2)}${domain}`;
}

function getPasswordError(value: string): string | null {
  if (value.length < 8) return '密码至少 8 位';
  if (!/[A-Z]/.test(value)) return '密码需包含大写字母';
  if (!/[a-z]/.test(value)) return '密码需包含小写字母';
  if (!/\d/.test(value)) return '密码需包含数字';
  return null;
}

export function ResetPasswordModal({ open, onClose }: ResetPasswordModalProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { countdown, start: startCountdown } = useCountdown();

  const [current, setCurrent] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const email = user?.email ?? '';

  // 打开时重置状态
  useEffect(() => {
    if (open) {
      setCurrent(0);
      form.resetFields();
    }
  }, [open, form]);

  const handleSendCode = async () => {
    if (!email) {
      message.warning('未检测到邮箱信息');
      return;
    }
    setSendingCode(true);
    try {
      await sendEmailCode(email);
      message.success('验证码已发送至邮箱');
      startCountdown(60);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        message.error('发送过于频繁，请稍后再试');
      } else {
        message.error('验证码发送失败');
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmitReset = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await resetPassword(email, values.code, values.newPassword);
      setCurrent(1);
    } catch (error) {
      // 验证码错误或过期，清空验证码，留在当前页面，新密码保留
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        message.error('验证码错误或已过期，请重新获取');
        form.setFieldValue('code', '');
        return;
      }
      const apiMessage = axios.isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined;
      const text = Array.isArray(apiMessage)
        ? apiMessage.join('；')
        : (apiMessage ?? '密码重置失败');
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    const isSuccess = current === 1;
    onClose();
    if (isSuccess) {
      // 清除本地凭证并跳转登录页，引导用户重新登录
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  const footerButtons = () => {
    if (current === 0) {
      return (
        <>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmitReset}>
            确认重置
          </Button>
        </>
      );
    }
    return (
      <Button type="primary" onClick={handleClose}>
        关闭
      </Button>
    );
  };

  return (
    <Modal
      title="重置密码"
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      destroyOnClose
      footer={footerButtons()}
    >
      {current === 0 ? (
        <Form form={form} layout="vertical" requiredMark={false}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            验证码将发送至 <Text strong>{maskEmail(email)}</Text>
          </Text>
          <Form.Item
            name="code"
            label="邮箱验证码"
            rules={[
              { required: true, message: '请输入验证码' },
              { len: 6, message: '请输入 6 位验证码' },
              { pattern: /^\d{6}$/, message: '验证码为 6 位数字' },
            ]}
          >
            <Input
              placeholder="请输入 6 位验证码"
              maxLength={6}
              suffix={
                <Button
                  type="link"
                  size="small"
                  onClick={handleSendCode}
                  loading={sendingCode}
                  disabled={countdown > 0}
                  style={{ padding: 0 }}
                >
                  {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                </Button>
              }
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              {
                validator: (_, value: string) => {
                  if (!value) return Promise.resolve();
                  const err = getPasswordError(value);
                  return err ? Promise.reject(err) : Promise.resolve();
                },
              },
            ]}
            extra="要求：≥8 位，含大小写字母和数字"
          >
            <Input.Password placeholder="请输入新密码" maxLength={64} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator: (_, value: string) => {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('两次输入的密码不一致');
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              maxLength={64}
              autoComplete="new-password"
            />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message="验证码 5 分钟内有效，请注意查收。"
            style={{ marginTop: 8 }}
          />
        </Form>
      ) : null}

      {current === 1 ? (
        <Result
          status="success"
          title="密码重置成功"
          subTitle={
            <div>
              <Text>系统已向你的邮箱发送安全通知邮件。</Text>
              <br />
              <Text type="secondary">建议重新登录以刷新会话凭证。</Text>
            </div>
          }
        />
      ) : null}
    </Modal>
  );
}
