import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import DatePicker from 'antd/es/date-picker';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import { CopyOutlined } from '@ant-design/icons';
import { useAuth } from '../../../shared/hooks/useAuth';
import type { CreateApiKeyResult } from '../types';
import { ScopeSelector } from './ScopeSelector';

interface CreateApiKeyModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: { name: string; scopes?: string[]; expiresAt?: string }) => void;
  loading: boolean;
  result?: CreateApiKeyResult;
  onCopyComplete?: () => void;
}

export function CreateApiKeyModal({
  open,
  onCancel,
  onSubmit,
  loading,
  result,
  onCopyComplete,
}: CreateApiKeyModalProps) {
  const [form] = Form.useForm();
  const { user } = useAuth();

  const userPermissions = user?.permissions || [];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: { name: string; scopes?: string[]; expiresAt?: string } = {
        name: values.name,
        scopes: values.scopes,
      };
      if (values.expiresAt && values.expiresAt.$d) {
        data.expiresAt = values.expiresAt.$d.toISOString();
      }
      onSubmit(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleCopyKey = () => {
    if (result?.key) {
      navigator.clipboard.writeText(result.key);
      message.success('API Key 已复制到剪贴板');
      onCopyComplete?.();
    }
  };

  return (
    <Modal
      title="创建 API Key"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={720}
    >
      {result ? (
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 16, color: '#ff4d4f', fontWeight: 500 }}>
            ⚠️ 请立即复制您的 API Key，它只会显示这一次！
          </div>
          <div
            style={{
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 14,
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>{result.key}</span>
            <Button type="primary" size="small" icon={<CopyOutlined />} onClick={handleCopyKey}>
              复制
            </Button>
          </div>
          <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
            <p>• 名称: {result.name}</p>
            <p>• 前缀: {result.prefix}</p>
            <p>• 状态: {result.status}</p>
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入 API Key 名称' }]}
          >
            <Input placeholder="例如：生产环境 API Key" />
          </Form.Item>

          <Form.Item label="权限范围" name="scopes" tooltip="指定 API Key 可以访问的资源范围">
            <ScopeSelector options={userPermissions} />
          </Form.Item>

          <Form.Item label="过期时间" name="expiresAt" tooltip="留空表示永不过期">
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="选择过期时间"
              disabledDate={(date) => date && date.valueOf() < Date.now()}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
