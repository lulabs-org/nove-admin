import {
  ClockCircleOutlined,
  DesktopOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
} from '@ant-design/icons';
import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Col from 'antd/es/col';
import Descriptions from 'antd/es/descriptions';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import List from 'antd/es/list';
import Modal from 'antd/es/modal';
import Pagination from 'antd/es/pagination';
import Popconfirm from 'antd/es/popconfirm';
import Radio from 'antd/es/radio';
import Row from 'antd/es/row';
import Skeleton from 'antd/es/skeleton';
import Space from 'antd/es/space';
import Steps from 'antd/es/steps';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Typography from 'antd/es/typography';
import message from 'antd/es/message';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  accountSecurityControllerChangeEmail,
  accountSecurityControllerChangePassword,
  accountSecurityControllerChangePhone,
  accountSecurityControllerGetLoginActivities,
  accountSecurityControllerGetSecurity,
  accountSecurityControllerListSessions,
  accountSecurityControllerRevokeOtherSessions,
  accountSecurityControllerRevokeSession,
  accountSecurityControllerSendEmailCode,
  accountSecurityControllerSendIdentityCode,
  accountSecurityControllerSendPhoneCode,
  accountSecurityControllerVerifyIdentity,
} from '../../../shared/lib/api/orval/business/account-security';
import type {
  LoginActivityDto,
  SecuritySessionDto,
} from '../../../shared/lib/api/orval/business/schemas';
import { useAuthStore } from '../../auth/model/authStore';
import './SecurityPage.css';

const { Text, Title } = Typography;
type SecurityAction = 'password' | 'email' | 'phone';
type VerificationMethod = 'password' | 'email_code' | 'phone_code';

interface SecurityFormValues {
  verificationMethod: VerificationMethod;
  currentPassword?: string;
  identityCode?: string;
  newPassword?: string;
  confirmPassword?: string;
  email?: string;
  countryCode?: '+86';
  phone?: string;
  newCode?: string;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const value = error.response?.data?.message;
    if (Array.isArray(value)) return value.join('；');
    if (value) return value;
  }
  return fallback;
}

function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);
  return { seconds, start: () => setSeconds(60) };
}

function loginTypeLabel(type: string) {
  const labels: Record<string, string> = {
    USERNAME_PASSWORD: '用户名密码',
    EMAIL_PASSWORD: '邮箱密码',
    EMAIL_CODE: '邮箱验证码',
    PHONE_PASSWORD: '手机密码',
    PHONE_CODE: '手机验证码',
    PASSWORD_RESET: '密码重置',
  };
  return labels[type] || type;
}

export function SecurityPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [form] = Form.useForm<SecurityFormValues>();
  const [action, setAction] = useState<SecurityAction | null>(null);
  const [step, setStep] = useState(0);
  const [verifyingIdentity, setVerifyingIdentity] = useState(false);
  const [sendingIdentityCode, setSendingIdentityCode] = useState(false);
  const [sendingNewContactCode, setSendingNewContactCode] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const identityCountdown = useCountdown();
  const newContactCountdown = useCountdown();
  const verificationMethod = Form.useWatch('verificationMethod', form);

  const securityQuery = useQuery({
    queryKey: ['account-security'],
    queryFn: ({ signal }) => accountSecurityControllerGetSecurity(signal),
  });
  const sessionsQuery = useQuery({
    queryKey: ['account-security-sessions'],
    queryFn: ({ signal }) => accountSecurityControllerListSessions(signal),
  });
  const activitiesQuery = useQuery({
    queryKey: ['account-security-activities', activityPage],
    queryFn: ({ signal }) =>
      accountSecurityControllerGetLoginActivities({ page: activityPage, pageSize: 10 }, signal),
  });

  const refreshSecurity = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['account-security'] }),
      queryClient.invalidateQueries({ queryKey: ['account-security-sessions'] }),
      queryClient.invalidateQueries({ queryKey: ['account-security-activities'] }),
      queryClient.invalidateQueries({ queryKey: ['settings-profile'] }),
    ]);
  };

  const submitMutation = useMutation({
    mutationFn: async (values: SecurityFormValues) => {
      const proof = {
        verificationMethod: values.verificationMethod,
        ...(values.verificationMethod === 'password'
          ? { currentPassword: values.currentPassword }
          : { identityCode: values.identityCode }),
      };
      if (action === 'password') {
        return accountSecurityControllerChangePassword({
          ...proof,
          newPassword: values.newPassword!,
        });
      }
      if (action === 'email') {
        return accountSecurityControllerChangeEmail({
          ...proof,
          email: values.email!,
          newCode: values.newCode!,
        });
      }
      return accountSecurityControllerChangePhone({
        ...proof,
        countryCode: values.countryCode!,
        phone: values.phone!,
        newCode: values.newCode!,
      });
    },
    onSuccess: async (result) => {
      await refreshSecurity();
      const sessionResult = result as {
        revokedSessionsCount?: number;
        currentSessionPreserved?: boolean;
      };
      const baseMessage =
        action === 'password' ? '密码已更新' : action === 'email' ? '邮箱已换绑' : '手机号已换绑';
      const revokedMessage =
        action !== 'password' && typeof sessionResult.revokedSessionsCount === 'number'
          ? `，已下线 ${sessionResult.revokedSessionsCount} 台其他设备`
          : '';
      message.success(`${baseMessage}${revokedMessage}`);
      setAction(null);
      form.resetFields();
      if (sessionResult.currentSessionPreserved === false) {
        clearAuth();
        navigate('/login', { replace: true });
      }
    },
    onError: (error) => message.error(getErrorMessage(error, '安全设置更新失败')),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => accountSecurityControllerRevokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-security-sessions'] });
      message.success('设备已下线');
    },
    onError: (error) => message.error(getErrorMessage(error, '设备下线失败')),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: accountSecurityControllerRevokeOtherSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-security-sessions'] });
      message.success('其他设备已全部下线');
    },
    onError: (error) => message.error(getErrorMessage(error, '设备下线失败')),
  });

  const defaultMethod = useMemo<VerificationMethod | undefined>(() => {
    const methods = securityQuery.data?.availableVerificationMethods || [];
    return methods.includes('password')
      ? 'password'
      : methods.includes('email_code')
        ? 'email_code'
        : methods.includes('phone_code')
          ? 'phone_code'
          : undefined;
  }, [securityQuery.data]);

  const openAction = (nextAction: SecurityAction) => {
    if (!defaultMethod) {
      message.warning('当前账号没有可用的身份确认方式，请联系管理员恢复账号');
      return;
    }
    setAction(nextAction);
    setStep(0);
    form.resetFields();
    form.setFieldsValue({ verificationMethod: defaultMethod, countryCode: '+86' });
  };

  const sendIdentityCode = async () => {
    const channel = verificationMethod === 'email_code' ? 'email' : 'phone';
    form.setFields([{ name: 'identityCode', errors: [] }]);
    setSendingIdentityCode(true);
    try {
      const result = await accountSecurityControllerSendIdentityCode({ channel });
      identityCountdown.start();
      message.success(`验证码已发送至 ${result.maskedTarget || '当前联系方式'}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '验证码发送失败，请稍后重试');
      form.setFields([{ name: 'identityCode', errors: [errorMessage] }]);
      message.error(errorMessage);
    } finally {
      setSendingIdentityCode(false);
    }
  };

  const sendNewContactCode = async () => {
    form.setFields([{ name: 'newCode', errors: [] }]);
    setSendingNewContactCode(true);
    try {
      if (action === 'email') {
        const { email } = await form.validateFields(['email']);
        await accountSecurityControllerSendEmailCode({ email: email! });
      } else {
        const { countryCode, phone } = await form.validateFields(['countryCode', 'phone']);
        await accountSecurityControllerSendPhoneCode({
          countryCode: countryCode!,
          phone: phone!,
        });
      }
      newContactCountdown.start();
      message.success('新联系方式验证码已发送');
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      const errorMessage = getErrorMessage(error, '验证码发送失败，请稍后重试');
      form.setFields([{ name: 'newCode', errors: [errorMessage] }]);
      message.error(errorMessage);
    } finally {
      setSendingNewContactCode(false);
    }
  };

  const nextStep = async () => {
    const fields =
      verificationMethod === 'password'
        ? ['verificationMethod', 'currentPassword']
        : ['verificationMethod', 'identityCode'];
    const values = await form.validateFields(fields);
    const proof = {
      verificationMethod: values.verificationMethod,
      ...(values.verificationMethod === 'password'
        ? { currentPassword: values.currentPassword }
        : { identityCode: values.identityCode }),
    };
    setVerifyingIdentity(true);
    try {
      await accountSecurityControllerVerifyIdentity(proof);
      setStep(1);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '身份验证失败');
      form.setFields([
        {
          name: values.verificationMethod === 'password' ? 'currentPassword' : 'identityCode',
          errors: [errorMessage],
        },
      ]);
      message.error(errorMessage);
    } finally {
      setVerifyingIdentity(false);
    }
  };

  const submit = async () => {
    const fields =
      action === 'password'
        ? ['newPassword', 'confirmPassword']
        : action === 'email'
          ? ['email', 'newCode']
          : ['countryCode', 'phone', 'newCode'];
    await form.validateFields(fields);
    submitMutation.mutate(form.getFieldsValue(true));
  };

  const status = securityQuery.data;
  const sessions = sessionsQuery.data || [];
  const otherSessions = sessions.filter((session) => !session.current);
  const activityColumns = [
    { title: '时间', dataIndex: 'createdAt', width: 180, render: formatDateTime },
    { title: '登录方式', dataIndex: 'loginType', width: 130, render: loginTypeLabel },
    { title: 'IP 地址', dataIndex: 'ip', width: 150 },
    {
      title: '设备',
      dataIndex: 'userAgent',
      ellipsis: true,
      render: (value?: string | null) => value || '未知设备',
    },
    {
      title: '结果',
      dataIndex: 'success',
      width: 100,
      render: (success: boolean, record: LoginActivityDto) =>
        success ? (
          <Tag color="success">成功</Tag>
        ) : (
          <Tag color="error">{record.failReason || '失败'}</Tag>
        ),
    },
  ];

  if (securityQuery.isLoading) {
    return <Skeleton className="security-page" active paragraph={{ rows: 12 }} />;
  }

  return (
    <div className="security-page">
      <div className="security-header">
        <div>
          <Title level={3}>安全设置</Title>
          <Text type="secondary">管理账号凭据、联系方式和已登录设备</Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          loading={securityQuery.isFetching || sessionsQuery.isFetching}
          onClick={refreshSecurity}
        >
          刷新
        </Button>
      </div>

      {securityQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="安全状态加载失败"
          description={getErrorMessage(securityQuery.error, '请稍后重试')}
        />
      ) : null}

      <Row gutter={[16, 16]} className="security-overview">
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LockOutlined />
                账号保护
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="登录密码">
                <Tag color={status?.hasPassword ? 'success' : 'warning'}>
                  {status?.hasPassword ? '已设置' : '未设置'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="设置时间">
                {formatDateTime(status?.passwordSetAt)}
              </Descriptions.Item>
            </Descriptions>
            <Button type="primary" icon={<KeyOutlined />} onClick={() => openAction('password')}>
              {status?.hasPassword ? '修改密码' : '设置密码'}
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                安全联系方式
              </Space>
            }
          >
            <List
              dataSource={[
                {
                  key: 'email',
                  icon: <MailOutlined />,
                  label: '邮箱',
                  value: status?.email || '未绑定',
                  verified: status?.emailVerified,
                },
                {
                  key: 'phone',
                  icon: <MobileOutlined />,
                  label: '手机号',
                  value: status?.phone ? `${status.countryCode || ''} ${status.phone}` : '未绑定',
                  verified: status?.phoneVerified,
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="change"
                      type="link"
                      onClick={() => openAction(item.key as SecurityAction)}
                    >
                      {item.value === '未绑定' ? '绑定' : '换绑'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={
                      <Space>
                        {item.label}
                        <Tag color={item.verified ? 'success' : 'default'}>
                          {item.verified ? '已验证' : '未验证'}
                        </Tag>
                      </Space>
                    }
                    description={item.value}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="security-section"
        title={
          <Space>
            <DesktopOutlined />
            登录设备
          </Space>
        }
        extra={
          otherSessions.length ? (
            <Popconfirm
              title="下线全部其他设备？"
              description="这些设备的刷新令牌将立即失效。"
              onConfirm={() => revokeOthersMutation.mutate()}
            >
              <Button danger loading={revokeOthersMutation.isPending}>
                全部下线
              </Button>
            </Popconfirm>
          ) : null
        }
      >
        <Alert
          className="security-session-note"
          type="info"
          showIcon
          message="设备下线后，已签发的访问令牌最多仍可能继续有效 15 分钟。"
        />
        <List<SecuritySessionDto>
          loading={sessionsQuery.isLoading}
          dataSource={sessions}
          locale={{ emptyText: '暂无活跃设备' }}
          renderItem={(session) => (
            <List.Item
              actions={
                session.current
                  ? [
                      <Tag key="current" color="processing">
                        当前设备
                      </Tag>,
                    ]
                  : [
                      <Popconfirm
                        key="revoke"
                        title="下线这个设备？"
                        onConfirm={() => revokeSessionMutation.mutate(session.id)}
                      >
                        <Button danger type="link" icon={<StopOutlined />}>
                          下线
                        </Button>
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={<DesktopOutlined className="security-device-icon" />}
                title={session.deviceInfo || '未知设备'}
                description={
                  <Space size="large" wrap>
                    <Text type="secondary">IP：{session.ip || '-'}</Text>
                    <Text type="secondary">最近活动：{formatDateTime(session.lastActiveAt)}</Text>
                    <Text type="secondary">到期：{formatDateTime(session.expiresAt)}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        className="security-section"
        title={
          <Space>
            <ClockCircleOutlined />
            最近 30 天登录记录
          </Space>
        }
      >
        <Table<LoginActivityDto>
          rowKey="id"
          size="middle"
          loading={activitiesQuery.isLoading}
          dataSource={activitiesQuery.data?.items || []}
          columns={activityColumns}
          pagination={false}
          rowClassName={(record) => (record.success ? '' : 'security-login-failed')}
          scroll={{ x: 820 }}
        />
        {(activitiesQuery.data?.total || 0) > 10 ? (
          <Pagination
            className="security-pagination"
            current={activityPage}
            pageSize={10}
            total={activitiesQuery.data?.total || 0}
            showSizeChanger={false}
            onChange={setActivityPage}
          />
        ) : null}
      </Card>

      <Modal
        open={Boolean(action)}
        title={action === 'password' ? '修改密码' : action === 'email' ? '换绑邮箱' : '换绑手机号'}
        onCancel={() => setAction(null)}
        footer={
          step === 0
            ? [
                <Button key="cancel" onClick={() => setAction(null)}>
                  取消
                </Button>,
                <Button key="next" type="primary" loading={verifyingIdentity} onClick={nextStep}>
                  验证并继续
                </Button>,
              ]
            : [
                <Button key="back" onClick={() => setStep(0)}>
                  上一步
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={submitMutation.isPending}
                  onClick={submit}
                >
                  确认提交
                </Button>,
              ]
        }
        destroyOnHidden
      >
        <Steps
          className="security-modal-steps"
          size="small"
          current={step}
          items={[
            { title: '身份确认' },
            { title: action === 'password' ? '设置新密码' : '验证新联系方式' },
          ]}
        />
        <Form form={form} layout="vertical" requiredMark={false}>
          {step === 0 ? (
            <>
              <Form.Item name="verificationMethod" label="确认方式" rules={[{ required: true }]}>
                <Radio.Group>
                  {status?.availableVerificationMethods.includes('password') ? (
                    <Radio value="password">当前密码</Radio>
                  ) : null}
                  {status?.availableVerificationMethods.includes('email_code') ? (
                    <Radio value="email_code">邮箱验证码</Radio>
                  ) : null}
                  {status?.availableVerificationMethods.includes('phone_code') ? (
                    <Radio value="phone_code">手机验证码</Radio>
                  ) : null}
                </Radio.Group>
              </Form.Item>
              {verificationMethod === 'password' ? (
                <Form.Item
                  name="currentPassword"
                  label="当前密码"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password autoComplete="current-password" />
                </Form.Item>
              ) : (
                <Form.Item label="身份验证码" required>
                  <Space.Compact block>
                    <Form.Item
                      name="identityCode"
                      noStyle
                      rules={[
                        { required: true, message: '请输入验证码' },
                        { pattern: /^\d{6}$/, message: '请输入 6 位验证码' },
                      ]}
                    >
                      <Input maxLength={6} placeholder="6 位验证码" />
                    </Form.Item>
                    <Button
                      loading={sendingIdentityCode}
                      disabled={identityCountdown.seconds > 0}
                      onClick={sendIdentityCode}
                    >
                      {identityCountdown.seconds ? `${identityCountdown.seconds}s` : '发送验证码'}
                    </Button>
                  </Space.Compact>
                </Form.Item>
              )}
            </>
          ) : action === 'password' ? (
            <>
              <Alert
                className="security-password-tip"
                type="info"
                showIcon
                message="密码至少 8 位，并同时包含大写字母、小写字母和数字。修改成功后其他设备会被下线。"
              />
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true },
                  { min: 8, message: '密码至少 8 位' },
                  {
                    pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '必须包含大小写字母和数字',
                  },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      return !value || getFieldValue('newPassword') === value
                        ? Promise.resolve()
                        : Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </>
          ) : (
            <>
              {action === 'email' ? (
                <Form.Item
                  name="email"
                  label="新邮箱"
                  rules={[{ required: true }, { type: 'email', message: '邮箱格式不正确' }]}
                >
                  <Input prefix={<MailOutlined />} placeholder="name@example.com" />
                </Form.Item>
              ) : (
                <Space.Compact block>
                  <Form.Item name="countryCode" label="区号" rules={[{ required: true }]}>
                    <Input style={{ width: 100 }} disabled />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="新手机号"
                    rules={[
                      { required: true },
                      { pattern: /^[1-9]\d{10}$/, message: '手机号格式不正确' },
                    ]}
                  >
                    <Input prefix={<MobileOutlined />} />
                  </Form.Item>
                </Space.Compact>
              )}
              <Form.Item label="新联系方式验证码" required>
                <Space.Compact block>
                  <Form.Item
                    name="newCode"
                    noStyle
                    rules={[
                      { required: true, message: '请输入验证码' },
                      { pattern: /^\d{6}$/, message: '请输入 6 位验证码' },
                    ]}
                  >
                    <Input maxLength={6} placeholder="6 位验证码" />
                  </Form.Item>
                  <Button
                    loading={sendingNewContactCode}
                    disabled={newContactCountdown.seconds > 0}
                    onClick={sendNewContactCode}
                  >
                    {newContactCountdown.seconds ? `${newContactCountdown.seconds}s` : '发送验证码'}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
