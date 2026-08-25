import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Col from 'antd/es/col';
import Divider from 'antd/es/divider';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import Popconfirm from 'antd/es/popconfirm';
import Row from 'antd/es/row';
import Switch from 'antd/es/switch';
import Tabs from 'antd/es/tabs';
import message from 'antd/es/message';
import { useCallback, useEffect, useState } from 'react';
import { Perm } from '../../../app/guards/Perm';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import { systemConfigApi } from './api/systemConfigApi';
import { buildMailConfigPayload, buildWechatShopConfigPayload } from './lib/configPayload';
import type { MailConfig, WechatShopConfig } from './types';
import './SystemConfigManagement.css';

export function SystemConfigManagement() {
  const [mailForm] = Form.useForm<MailConfig>();
  const [wechatShopForm] = Form.useForm<WechatShopConfig>();
  const [loading, setLoading] = useState({ mail: false, wechatShop: false });
  const [saving, setSaving] = useState({ mail: false, wechatShop: false });
  const [deleting, setDeleting] = useState({ mail: false, wechatShop: false });

  const loadMailConfig = useCallback(async () => {
    setLoading((current) => ({ ...current, mail: true }));
    try {
      const config = await systemConfigApi.getMailConfig();
      if (config) {
        mailForm.setFieldsValue(config);
      } else {
        mailForm.resetFields();
      }
    } catch {
      message.error('加载邮件配置失败');
    } finally {
      setLoading((current) => ({ ...current, mail: false }));
    }
  }, [mailForm]);

  const loadWechatShopConfig = useCallback(async () => {
    setLoading((current) => ({ ...current, wechatShop: true }));
    try {
      const config = await systemConfigApi.getWechatShopConfig();
      if (config) {
        wechatShopForm.setFieldsValue(config);
      } else {
        wechatShopForm.resetFields();
      }
    } catch {
      message.error('加载微信小店配置失败');
    } finally {
      setLoading((current) => ({ ...current, wechatShop: false }));
    }
  }, [wechatShopForm]);

  useEffect(() => {
    void Promise.all([loadMailConfig(), loadWechatShopConfig()]);
  }, [loadMailConfig, loadWechatShopConfig]);

  const saveMailConfig = async (values: MailConfig) => {
    setSaving((current) => ({ ...current, mail: true }));
    try {
      await systemConfigApi.updateMailConfig(buildMailConfigPayload(values));
      message.success('邮件配置已保存');
      await loadMailConfig();
    } catch {
      message.error('保存邮件配置失败');
    } finally {
      setSaving((current) => ({ ...current, mail: false }));
    }
  };

  const saveWechatShopConfig = async (values: WechatShopConfig) => {
    setSaving((current) => ({ ...current, wechatShop: true }));
    try {
      await systemConfigApi.updateWechatShopConfig(buildWechatShopConfigPayload(values));
      message.success('微信小店配置已保存');
      await loadWechatShopConfig();
    } catch {
      message.error('保存微信小店配置失败');
    } finally {
      setSaving((current) => ({ ...current, wechatShop: false }));
    }
  };

  const deleteMailConfig = async () => {
    setDeleting((current) => ({ ...current, mail: true }));
    try {
      await systemConfigApi.deleteConfig('mail');
      mailForm.resetFields();
      message.success('邮件配置已删除');
    } catch {
      message.error('删除邮件配置失败');
    } finally {
      setDeleting((current) => ({ ...current, mail: false }));
    }
  };

  const deleteWechatShopConfig = async () => {
    setDeleting((current) => ({ ...current, wechatShop: true }));
    try {
      await systemConfigApi.deleteConfig('wechat-shop');
      wechatShopForm.resetFields();
      message.success('微信小店配置已删除');
    } catch {
      message.error('删除微信小店配置失败');
    } finally {
      setDeleting((current) => ({ ...current, wechatShop: false }));
    }
  };

  return (
    <div className="system-config-page">
      <Tabs
        className="system-config-tabs"
        items={[
          {
            key: 'mail',
            label: '邮件服务',
            forceRender: true,
            children: (
              <Card
                className="system-config-card"
                loading={loading.mail}
                title={
                  <div className="system-config-card-heading">
                    <span>SMTP 邮件配置</span>
                    <span>用于系统通知、验证码和账号找回邮件</span>
                  </div>
                }
                extra={
                  <Button icon={<ReloadOutlined />} onClick={() => void loadMailConfig()}>
                    刷新
                  </Button>
                }
              >
                <Alert
                  className="system-config-secret-tip"
                  type="info"
                  showIcon
                  message="密码更新说明"
                  description="已配置的密码会以 ******** 显示。无需修改时保持原样；输入新密码后将替换当前密码。"
                />
                <Form
                  className="system-config-form"
                  form={mailForm}
                  layout="vertical"
                  onFinish={saveMailConfig}
                  initialValues={{ port: 587, secure: false }}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        label="SMTP 主机"
                        name="host"
                        rules={[{ required: true, message: '请输入 SMTP 主机' }]}
                      >
                        <Input placeholder="smtp.example.com" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="端口"
                        name="port"
                        rules={[{ required: true, message: '请输入端口' }]}
                      >
                        <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="用户名"
                        name="user"
                        rules={[{ required: true, message: '请输入用户名' }]}
                      >
                        <Input autoComplete="username" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="发件人地址"
                        name="from"
                        rules={[
                          { required: true, type: 'email', message: '请输入有效的发件人地址' },
                        ]}
                      >
                        <Input placeholder="noreply@example.com" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="密码" name="pass">
                    <Input.Password
                      autoComplete="new-password"
                      placeholder="输入新密码以替换"
                      visibilityToggle={false}
                    />
                  </Form.Item>
                  <div className="system-config-switch-row">
                    <div>
                      <div className="system-config-switch-title">SSL/TLS 加密</div>
                      <div className="system-config-switch-description">
                        建议根据邮件服务商的端口要求启用
                      </div>
                    </div>
                    <Form.Item name="secure" valuePropName="checked" noStyle>
                      <Switch checkedChildren="启用" unCheckedChildren="关闭" />
                    </Form.Item>
                  </div>
                  <Divider className="system-config-divider" />
                  <div className="system-config-actions">
                    <Perm permission={PERMISSIONS.SYSTEM.CONFIG_WRITE}>
                      <Popconfirm
                        title="删除邮件配置？"
                        description="删除后邮件服务将无法使用，直到重新配置。"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true, loading: deleting.mail }}
                        onConfirm={deleteMailConfig}
                      >
                        <Button danger loading={deleting.mail}>
                          删除配置
                        </Button>
                      </Popconfirm>
                    </Perm>
                    <Perm permission={PERMISSIONS.SYSTEM.CONFIG_WRITE}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving.mail}
                      >
                        保存配置
                      </Button>
                    </Perm>
                  </div>
                </Form>
              </Card>
            ),
          },
          {
            key: 'wechat-shop',
            label: '微信小店',
            forceRender: true,
            children: (
              <Card
                className="system-config-card"
                loading={loading.wechatShop}
                title={
                  <div className="system-config-card-heading">
                    <span>微信小店配置</span>
                    <span>用于微信小店回调验证和订单同步</span>
                  </div>
                }
                extra={
                  <Button icon={<ReloadOutlined />} onClick={() => void loadWechatShopConfig()}>
                    刷新
                  </Button>
                }
              >
                <Alert
                  className="system-config-secret-tip"
                  type="info"
                  showIcon
                  message="密钥更新说明"
                  description="已配置的密钥会以 ******** 显示。无需修改时保持原样；输入新值后将替换当前密钥。"
                />
                <Form
                  className="system-config-form"
                  form={wechatShopForm}
                  layout="vertical"
                  onFinish={saveWechatShopConfig}
                >
                  <Form.Item
                    label="App ID"
                    name="appId"
                    rules={[{ required: true, message: '请输入 App ID' }]}
                  >
                    <Input placeholder="wx1234567890abcdef" />
                  </Form.Item>
                  <Form.Item label="App Secret" name="appSecret">
                    <Input.Password
                      autoComplete="new-password"
                      placeholder="输入新 App Secret 以替换"
                      visibilityToggle={false}
                    />
                  </Form.Item>
                  <Form.Item label="Webhook Token" name="webhookToken">
                    <Input.Password
                      autoComplete="new-password"
                      placeholder="输入新 Webhook Token 以替换"
                      visibilityToggle={false}
                    />
                  </Form.Item>
                  <Form.Item label="Encoding AES Key" name="encodingAesKey">
                    <Input.Password
                      autoComplete="new-password"
                      placeholder="输入新 Encoding AES Key 以替换"
                      visibilityToggle={false}
                    />
                  </Form.Item>
                  <Form.Item
                    label="API Base URL"
                    name="apiBaseUrl"
                    rules={[{ type: 'url', message: '请输入有效的 URL' }]}
                  >
                    <Input placeholder="https://api.weixin.qq.com" />
                  </Form.Item>
                  <Divider className="system-config-divider" />
                  <div className="system-config-actions">
                    <Perm permission={PERMISSIONS.SYSTEM.CONFIG_WRITE}>
                      <Popconfirm
                        title="删除微信小店配置？"
                        description="删除后微信小店回调与订单同步将不可用，直到重新配置。"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true, loading: deleting.wechatShop }}
                        onConfirm={deleteWechatShopConfig}
                      >
                        <Button danger loading={deleting.wechatShop}>
                          删除配置
                        </Button>
                      </Popconfirm>
                    </Perm>
                    <Perm permission={PERMISSIONS.SYSTEM.CONFIG_WRITE}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving.wechatShop}
                      >
                        保存配置
                      </Button>
                    </Perm>
                  </div>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
