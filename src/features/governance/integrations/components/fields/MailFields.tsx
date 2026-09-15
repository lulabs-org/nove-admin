import Col from 'antd/es/col';
import ColorPicker from 'antd/es/color-picker';
import type { Color } from 'antd/es/color-picker';
import Divider from 'antd/es/divider';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import Row from 'antd/es/row';
import Switch from 'antd/es/switch';
import type { MailConfig } from '../../types';
import { SecretInput } from '../SecretInput';

export function MailFields({ form }: { form: ReturnType<typeof Form.useForm<MailConfig>>[0] }) {
  return (
    <Form className="integrations-form" form={form} layout="vertical">
      <Divider titlePlacement="start">SMTP 设置</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="SMTP 主机" name="host" rules={[{ required: true }]}>
            <Input placeholder="smtp.example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="端口" name="port" rules={[{ required: true }]}>
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="用户名" name="user" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="发件人地址" name="from" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="noreply@example.com" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="密码" name="pass" rules={[{ required: true }]}>
        <SecretInput placeholder="输入新密码以替换" />
      </Form.Item>
      <div className="integrations-switch-row">
        <div>
          <div className="integrations-switch-title">SSL/TLS 加密</div>
          <div className="integrations-switch-description">根据邮件服务商端口要求启用</div>
        </div>
        <Form.Item name="secure" valuePropName="checked" noStyle>
          <Switch checkedChildren="启用" unCheckedChildren="关闭" />
        </Form.Item>
      </div>
      <Divider titlePlacement="start">邮件品牌</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="品牌名称" name="brandName">
            <Input placeholder="Nove System" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="主题色"
            name="brandPrimaryColor"
            getValueFromEvent={(color: Color) => color.toHexString()}
            rules={[{ pattern: /^#[0-9a-fA-F]{6}$/ }]}
          >
            <ColorPicker
              disabledAlpha
              format="hex"
              showText={(color) => color.toHexString()}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Logo URL" name="brandLogoUrl" rules={[{ type: 'url' }]}>
        <Input placeholder="https://example.com/logo.png" />
      </Form.Item>
      <Form.Item label="公开访问地址" name="brandPublicBaseUrl" rules={[{ type: 'url' }]}>
        <Input placeholder="https://app.example.com" />
      </Form.Item>
      <Form.Item label="页脚文字" name="brandFooterText">
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
}
