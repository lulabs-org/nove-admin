import { useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  getOrganizationControllerGetOrganizationQueryKey,
  useOrganizationControllerGetOrganization,
  useOrganizationControllerUpdateOrganization,
} from '../../../shared/lib/api/orval/business/admin-organizations';
import type { UpdateOrganizationDto } from '../../../shared/lib/api/orval/business/schemas';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import './OrganizationInfoPage.css';

const { Text, Title, Paragraph } = Typography;

function textValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '-';
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function OrganizationInfoPage() {
  const [form] = Form.useForm<UpdateOrganizationDto>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editorOpen, setEditorOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, checkPermission } = useAuth();
  const orgId = user?.currentOrgId || '';
  const canUpdate = checkPermission(PERMISSIONS.ORGANIZATION.UPDATE);

  const organizationQuery = useOrganizationControllerGetOrganization(orgId, {
    query: { enabled: !!orgId },
  });
  const updateOrganization = useOrganizationControllerUpdateOrganization({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getOrganizationControllerGetOrganizationQueryKey(orgId),
        });
        messageApi.success('企业信息已更新');
      },
      onError: () => messageApi.error('企业信息更新失败'),
    },
  });

  const organization = organizationQuery.data;

  const openEditor = () => {
    if (!organization) return;
    form.setFieldsValue({
      name: organization.name,
      code: organization.code,
      logo: textValue(organization.logo) === '-' ? undefined : String(organization.logo),
      description:
        textValue(organization.description) === '-' ? undefined : String(organization.description),
      active: organization.active,
    });
    setEditorOpen(true);
  };

  const saveOrganization = async () => {
    const values = await form.validateFields();
    await updateOrganization.mutateAsync({ orgId, data: values });
    setEditorOpen(false);
  };

  if (!orgId) {
    return <Empty description="当前账号尚未加入企业" />;
  }

  if (organizationQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!organization) {
    return <Empty description="企业信息加载失败" />;
  }

  const logo = textValue(organization.logo);
  const logoFallback = organization.name.trim().slice(0, 1).toUpperCase() || 'N';

  return (
    <div className="organization-info-page">
      {contextHolder}
      <Modal
        title="编辑企业信息"
        width={560}
        open={editorOpen}
        okText="保存"
        cancelText="取消"
        confirmLoading={updateOrganization.isPending}
        onCancel={() => setEditorOpen(false)}
        onOk={saveOrganization}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" className="organization-info-form">
          <Form.Item
            name="name"
            label="企业名称"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input placeholder="请输入企业名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="企业编码"
            rules={[{ required: true, message: '请输入企业编码' }]}
          >
            <Input placeholder="请输入企业编码" />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL">
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>
          <Form.Item name="description" label="企业简介">
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="填写企业简介" />
          </Form.Item>
          <Form.Item name="active" label="企业状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
      <div className="organization-info-tabs" role="tablist" aria-label="企业设置">
        <button
          className="organization-info-tab is-active"
          type="button"
          role="tab"
          aria-selected="true"
        >
          企业信息管理
        </button>
      </div>

      <section className="organization-info-section">
        <Title level={5} className="organization-info-section-title">
          基础信息
        </Title>
        <div className="organization-info-hero">
          <div className="organization-info-logo">
            {logo !== '-' ? <img src={logo} alt="" /> : logoFallback}
          </div>
          <div className="organization-info-hero-main">
            <Space size={8} wrap>
              <Title level={4}>{organization.name}</Title>
              <Tag color={organization.active ? 'success' : 'default'}>
                {organization.active ? '正常启用' : '已停用'}
              </Tag>
            </Space>
            <Paragraph>{textValue(organization.description)}</Paragraph>
          </div>
        </div>
      </section>

      <section className="organization-info-section organization-info-details">
        <div className="organization-info-section-header">
          <Title level={5} className="organization-info-section-title">
            更多信息
          </Title>
          {canUpdate && (
            <Button icon={<EditOutlined />} onClick={openEditor}>
              编辑
            </Button>
          )}
        </div>
        <dl className="organization-info-grid">
          <div>
            <dt>企业名称</dt>
            <dd>{organization.name}</dd>
          </div>
          <div>
            <dt>企业编码</dt>
            <dd className="organization-info-code">{organization.code}</dd>
          </div>
          <div>
            <dt>企业 ID</dt>
            <dd className="organization-info-code">{organization.id}</dd>
          </div>
          <div>
            <dt>企业状态</dt>
            <dd>{organization.active ? '启用' : '停用'}</dd>
          </div>
          <div>
            <dt>组织层级</dt>
            <dd>{organization.level}</dd>
          </div>
          <div>
            <dt>排序值</dt>
            <dd>{organization.sortOrder}</dd>
          </div>
          <div>
            <dt>创建时间</dt>
            <dd>{formatDate(organization.createdAt)}</dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{formatDate(organization.updatedAt)}</dd>
          </div>
        </dl>
        <div className="organization-info-description">
          <Text type="secondary">企业简介</Text>
          <Paragraph>{textValue(organization.description)}</Paragraph>
        </div>
      </section>
    </div>
  );
}
