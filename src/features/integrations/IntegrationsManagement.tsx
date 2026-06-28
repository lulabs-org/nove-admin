import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Button,
  Drawer,
  Form,
  Input,
  message,
  Spin,
  Space,
  Tag,
} from 'antd';
import { SettingOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../auth/model/authStore';
import { integrationApi } from './api/integrationApi';

const { Title, Text, Paragraph } = Typography;

const PLATFORMS = [
  {
    id: 'LARK',
    name: '飞书集成 (Lark)',
    description: '同步飞书通讯录，接收飞书会议回调和组织架构变更。',
    fields: [
      { name: 'appId', label: 'App ID', required: true },
      { name: 'appSecret', label: 'App Secret', required: true },
      { name: 'encryptKey', label: 'Encrypt Key', required: false },
      { name: 'verificationToken', label: 'Verification Token', required: false },
    ],
  },
  {
    id: 'TENCENT_MEETING',
    name: '腾讯会议 (Tencent Meeting)',
    description: '同步腾讯会议记录，自动拉取云录制视频与智能纪要。',
    fields: [
      { name: 'secretId', label: 'Secret ID', required: true },
      { name: 'secretKey', label: 'Secret Key', required: true },
      { name: 'appId', label: 'App ID', required: false },
      { name: 'sdkId', label: 'SDK ID', required: false },
    ],
  },
  {
    id: 'WECHAT_SHOP',
    name: '微信小店 / 小鹅通',
    description: '接收订单Webhook，同步交易数据，自动开通对应的课程或服务权限。',
    fields: [
      { name: 'shopId', label: 'Shop ID / 平台店铺 ID', required: true },
      { name: 'apiToken', label: 'API Token', required: true },
      { name: 'webhookSecret', label: 'Webhook Secret', required: false },
    ],
  },
];

export function IntegrationsManagement() {
  const currentOrgId = useAuthStore((state) => state.user?.currentOrgId);
  const queryClient = useQueryClient();

  const [activePlatform, setActivePlatform] = useState<(typeof PLATFORMS)[0] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch Integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', currentOrgId],
    queryFn: () => integrationApi.findAll(currentOrgId!),
    enabled: !!currentOrgId,
  });

  // Save Config Mutation
  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!currentOrgId || !activePlatform) return;

      const existing = integrations.find((i) => i.platform === activePlatform.id);

      const payload = {
        platform: activePlatform.id,
        config: values,
        active: true, // Auto-enable when saving config
      };

      if (existing) {
        return integrationApi.update(currentOrgId, activePlatform.id, payload);
      } else {
        return integrationApi.create(currentOrgId, payload);
      }
    },
    onSuccess: () => {
      message.success('配置已保存');
      setDrawerVisible(false);
      queryClient.invalidateQueries({ queryKey: ['integrations', currentOrgId] });
    },
    onError: (err) => {
      console.error(err);
      message.error('保存失败');
    },
  });

  // Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ platform, active }: { platform: string; active: boolean }) => {
      if (!currentOrgId) return;
      const existing = integrations.find((i) => i.platform === platform);
      if (existing) {
        return integrationApi.update(currentOrgId, platform, { active });
      } else {
        return integrationApi.create(currentOrgId, { platform, config: {}, active });
      }
    },
    onSuccess: () => {
      message.success('状态已更新');
      queryClient.invalidateQueries({ queryKey: ['integrations', currentOrgId] });
    },
  });

  const handleConfigClick = (platform: (typeof PLATFORMS)[0]) => {
    setActivePlatform(platform);

    // Load existing config if available
    const existing = integrations.find((i) => i.platform === platform.id);
    if (existing && existing.config) {
      form.setFieldsValue(existing.config);
    } else {
      form.resetFields();
    }

    setDrawerVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  if (!currentOrgId) {
    return <div style={{ padding: 24 }}>请先选择或创建一个组织。</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>集成中心 (Integrations)</Title>
        <Text type="secondary">管理第三方平台的接入配置、Webhook 和认证密钥。</Text>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[24, 24]}>
          {PLATFORMS.map((platform) => {
            const integration = integrations.find((i) => i.platform === platform.id);
            const isActive = integration?.active ?? false;
            const hasConfig = integration && Object.keys(integration.config || {}).length > 0;

            return (
              <Col xs={24} sm={12} lg={8} key={platform.id}>
                <Card
                  hoverable
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                  actions={[
                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      onClick={() => handleConfigClick(platform)}
                    >
                      配置
                    </Button>,
                  ]}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 16,
                    }}
                  >
                    <Space align="center">
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: '#f0f2f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: '#1890ff',
                        }}
                      >
                        <AppstoreAddOutlined />
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 500 }}>{platform.name}</span>
                    </Space>
                    <Switch
                      checked={isActive}
                      onChange={(checked) =>
                        toggleStatusMutation.mutate({ platform: platform.id, active: checked })
                      }
                      loading={toggleStatusMutation.isPending}
                    />
                  </div>

                  <Paragraph type="secondary" style={{ flex: 1, marginBottom: 16 }}>
                    {platform.description}
                  </Paragraph>

                  <div>
                    {hasConfig ? (
                      <Tag color="success">已配置</Tag>
                    ) : (
                      <Tag color="default">未配置</Tag>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer
        title={`配置 ${activePlatform?.name}`}
        width={480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSave} loading={saveMutation.isPending}>
              保存
            </Button>
          </Space>
        }
      >
        {activePlatform && (
          <Form form={form} layout="vertical">
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              配置将存储在当前组织 (ID: {currentOrgId}) 下，请妥善保管您的密钥。
            </Paragraph>

            {activePlatform.fields.map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={[{ required: field.required, message: `请输入 ${field.label}` }]}
              >
                <Input.Password placeholder={`输入您的 ${field.label}`} />
              </Form.Item>
            ))}

            <div style={{ marginTop: 32, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text strong>Webhook 配置指引</Text>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                请在 {activePlatform.name} 开放平台将 Webhook 地址指向:
                <br />
                <Text copyable style={{ color: '#1890ff' }}>
                  {`${window.location.origin}/api/webhooks/${activePlatform.id.toLowerCase().replace('_', '-')}`}
                </Text>
              </Paragraph>
            </div>
          </Form>
        )}
      </Drawer>
    </div>
  );
}
