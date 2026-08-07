import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Radio from 'antd/es/radio';
import Result from 'antd/es/result';
import Typography from 'antd/es/typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../../shared/hooks';
import { useAuthStore } from '../../auth/model/authStore';
import { resetPassword, sendEmailCode, sendPhoneCode } from '../api/passwordApi';

const { Text } = Typography;

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  // 原始手机号与国家代码（来自 getProfile，未经脱敏），用于发送验证码
  // 注意：authStore.user.phone 来自 getMe，已被脱敏（如 177****0943），不能用作 target
  phone?: string | null;
  countryCode?: string | null;
}

type VerifyChannel = 'email' | 'phone';

interface FormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// 与后端 isValidEmail 一致
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 与后端 isValidCnPhone 一致（11 位中国大陆手机号，不含国家码/+/空格/横线）
const PHONE_RE = /^[1-9]\d{10}$/;
// 与后端 ResetPasswordDto.newPassword 的 @Matches 字符集一致
const PASSWORD_ALLOWED_RE = /^[A-Za-z\d@$!%*#?&]+$/;

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  // 保留前2位 + 后2位，中间用 * 脱敏
  if (local.length <= 4) return `${local[0]}***${local.at(-1)}${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(local.length - 4)}${local.slice(-2)}${domain}`;
}

// 手机号脱敏：保留前3位 + 后2位，中间 *（PHONE_RE 已保证 11 位）
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  return `${digits.slice(0, 3)}${'*'.repeat(digits.length - 5)}${digits.slice(-2)}`;
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, '');
}

function normalizeCountryCode(raw?: string | null): string | undefined {
  const digits = raw ? raw.replace(/\D+/g, '') : '';
  return digits ? `+${digits}` : undefined;
}

function getPasswordError(value: string): string | null {
  if (value.length < 8) return '密码至少 8 位';
  if (!/[A-Z]/.test(value)) return '密码需包含大写字母';
  if (!/[a-z]/.test(value)) return '密码需包含小写字母';
  if (!/\d/.test(value)) return '密码需包含数字';
  if (!PASSWORD_ALLOWED_RE.test(value)) return '密码仅可含字母、数字和 @$!%*#?&';
  return null;
}

export function ResetPasswordModal({
  open,
  onClose,
  phone: phoneProp,
  countryCode: countryCodeProp,
}: ResetPasswordModalProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { countdown, start: startCountdown, clear: clearCountdown } = useCountdown();

  const [current, setCurrent] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [channel, setChannel] = useState<VerifyChannel>('email');

  // email 来自 getMe（未脱敏）；phone/countryCode 来自 getProfile（未脱敏），
  // 不能用 authStore.user.phone（getMe 已脱敏，无法通过校验也不能作 target）
  const email = user?.email ?? '';
  const phone = phoneProp ?? '';
  const countryCode = normalizeCountryCode(countryCodeProp);

  const hasEmail = EMAIL_RE.test(email);
  const hasPhone = PHONE_RE.test(normalizePhone(phone));
  const noChannel = !hasEmail && !hasPhone;

  // 打开时重置状态
  useEffect(() => {
    if (open) {
      setCurrent(0);
      setChannel(hasEmail ? 'email' : 'phone');
      form.resetFields();
      clearCountdown();
    }
  }, [open, hasEmail, form, clearCountdown]);

  const maskedTarget =
    channel === 'email' ? maskEmail(email) : `${countryCode ?? ''} ${maskPhone(phone)}`.trim();

  const handleChannelChange = (next: VerifyChannel) => {
    setChannel(next);
    form.setFieldValue('code', '');
    clearCountdown();
    // 保留 newPassword / confirmPassword，减少重复输入
  };

  const handleSendCode = async () => {
    // gating 已保证当前 channel 可用，无需再次校验
    setSendingCode(true);
    try {
      if (channel === 'email') {
        await sendEmailCode(email);
      } else {
        await sendPhoneCode(normalizePhone(phone), countryCode);
      }
      message.success(channel === 'email' ? '验证码已发送至邮箱' : '验证码已发送至手机');
      startCountdown(60);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        message.error('发送过于频繁，请稍后再试');
        startCountdown(60);
        return;
      }
      const apiMessage = axios.isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined;
      const text = Array.isArray(apiMessage) ? apiMessage.join('；') : apiMessage;
      message.error(text ?? '验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmitReset = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const target = channel === 'email' ? email : normalizePhone(phone);
      await resetPassword(target, values.code, values.newPassword);
      setCurrent(1);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;
        const text = Array.isArray(apiMessage) ? apiMessage.join('；') : apiMessage;

        if (status === 429) {
          message.error('发送过于频繁，请稍后再试');
          return;
        }
        if (status === 400) {
          // 验证码错误/过期：透传 message，清空验证码，保留新密码
          message.error(text ?? '验证码错误或已过期，请重新获取');
          form.setFieldValue('code', '');
          return;
        }
        message.error(text ?? '密码重置失败');
      } else {
        message.error('密码重置失败');
      }
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
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmitReset}
            disabled={noChannel || !user}
          >
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
        !user ? (
          <Text type="secondary">用户信息加载中…</Text>
        ) : (
          <Form form={form} layout="vertical" requiredMark={false}>
            <Radio.Group
              value={channel}
              onChange={(e) => handleChannelChange(e.target.value as VerifyChannel)}
              optionType="button"
              buttonStyle="solid"
              style={{ marginBottom: 16, width: '100%' }}
            >
              <Radio.Button value="email" disabled={!hasEmail}>
                邮箱验证码{!hasEmail ? '（未绑定）' : ''}
              </Radio.Button>
              <Radio.Button value="phone" disabled={!hasPhone}>
                手机验证码{!hasPhone ? '（未绑定）' : ''}
              </Radio.Button>
            </Radio.Group>

            {noChannel ? (
              <Alert
                type="warning"
                showIcon
                message="当前账号未绑定邮箱与手机号，无法重置密码，请联系管理员"
              />
            ) : (
              <>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  验证码将发送至 <Text strong>{maskedTarget}</Text>
                </Text>
                <Form.Item
                  name="code"
                  label={channel === 'email' ? '邮箱验证码' : '手机验证码'}
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
                  extra="要求：≥8 位，含大小写字母和数字；仅可含字母、数字和 @$!%*#?&"
                >
                  <Input.Password
                    placeholder="请输入新密码"
                    maxLength={64}
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
              </>
            )}
          </Form>
        )
      ) : null}

      {current === 1 ? (
        <Result
          status="success"
          title="密码重置成功"
          subTitle={
            <div>
              <Text>
                {channel === 'email'
                  ? '系统已向你的邮箱发送安全通知邮件。'
                  : '系统已向你的手机发送安全通知短信。'}
              </Text>
              <br />
              <Text type="secondary">建议重新登录以刷新会话凭证。</Text>
            </div>
          }
        />
      ) : null}
    </Modal>
  );
}
