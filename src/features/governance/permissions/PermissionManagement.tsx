import Button from 'antd/es/button';
import Empty from 'antd/es/empty';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Popconfirm from 'antd/es/popconfirm';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Switch from 'antd/es/switch';
import Table from 'antd/es/table';
import Tabs from 'antd/es/tabs';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import type { TableProps } from 'antd/es/table';
import {
  ApartmentOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Perm } from '../../../app/guards/Perm';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import {
  permissionManagementApi,
  type CreateDataPermissionRule,
  type CreatePermission,
  type DataPermissionRule,
  type DataPermissionRuleListParams,
  type PermissionItem,
  type PermissionListParams,
  type UpdateDataPermissionRule,
  type UpdatePermission,
} from './api/permissionManagementApi';
import './PermissionManagement.css';

const { Text } = Typography;
const { TextArea } = Input;

type ActiveTab = 'permissions' | 'dataRules';
type PermissionModalMode = 'create' | 'edit';
type DataRuleModalMode = 'create' | 'edit';
type PermissionType = CreatePermission['type'];

interface PermissionFilters {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  resource?: string;
  type?: PermissionType;
  active?: boolean;
}

interface DataRuleFilters {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  resource?: string;
  active?: boolean;
}

interface PermissionFormValues {
  name?: string;
  code?: string;
  description?: string;
  resource?: string;
  action?: string;
  type?: PermissionType;
  parentId?: string;
  level?: number | null;
  sortOrder?: number | null;
  active?: boolean;
}

interface DataRuleFormValues {
  name?: string;
  code?: string;
  description?: string;
  resource?: string;
  condition?: string;
  active?: boolean;
}

interface FlatPermission extends PermissionItem {
  depth: number;
  pathName: string;
}

interface PermissionResourceGroup {
  resource: string;
  count: number;
  activeCount: number;
}

const PERMISSION_TYPE_OPTIONS: Array<{ label: string; value: PermissionType; color: string }> = [
  { label: '菜单', value: 'MENU', color: 'processing' },
  { label: '按钮', value: 'BUTTON', color: 'purple' },
  { label: '接口', value: 'API', color: 'blue' },
  { label: '数据', value: 'DATA', color: 'cyan' },
  { label: '字段', value: 'FIELD', color: 'gold' },
];

function displayString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '';
}

function displayNullableText(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', { hour12: false });
}

function getPermissionTypeMeta(type?: string) {
  return (
    PERMISSION_TYPE_OPTIONS.find((item) => item.value === type) || {
      label: type || '-',
      value: (type || 'API') as PermissionType,
      color: 'default',
    }
  );
}

function flattenPermissions(tree: PermissionItem[], depth = 0, parentPath = ''): FlatPermission[] {
  return tree.flatMap((permission) => {
    const pathName = parentPath ? `${parentPath} / ${permission.name}` : permission.name;
    return [
      { ...permission, depth, pathName },
      ...flattenPermissions(permission.children || [], depth + 1, pathName),
    ];
  });
}

function toQueryParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
  ) as Partial<T>;
}

export function PermissionManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('permissions');
  const [permissionFilters, setPermissionFilters] = useState<PermissionFilters>({
    page: 1,
    pageSize: 10,
  });
  const [dataRuleFilters, setDataRuleFilters] = useState<DataRuleFilters>({
    page: 1,
    pageSize: 10,
  });

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionModalMode, setPermissionModalMode] = useState<PermissionModalMode>('create');
  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
  const [dataRuleModalOpen, setDataRuleModalOpen] = useState(false);
  const [dataRuleModalMode, setDataRuleModalMode] = useState<DataRuleModalMode>('create');
  const [editingDataRule, setEditingDataRule] = useState<DataPermissionRule | null>(null);

  const [permissionForm] = Form.useForm<PermissionFormValues>();
  const [dataRuleForm] = Form.useForm<DataRuleFormValues>();

  const permissionTreeQuery = useQuery({
    queryKey: ['permission-management-tree'],
    queryFn: permissionManagementApi.permissionTree,
  });

  const permissionListQuery = useQuery({
    queryKey: ['permission-management-list', permissionFilters],
    queryFn: () =>
      permissionManagementApi.listPermissions(
        toQueryParams(permissionFilters) as PermissionListParams
      ),
  });

  const dataRuleListQuery = useQuery({
    queryKey: ['permission-management-data-rules', dataRuleFilters],
    queryFn: () =>
      permissionManagementApi.listDataRules(
        toQueryParams(dataRuleFilters) as DataPermissionRuleListParams
      ),
  });

  const flatPermissions = useMemo(
    () => flattenPermissions(permissionTreeQuery.data || []),
    [permissionTreeQuery.data]
  );

  const resourceGroups = useMemo(() => {
    const groups = new Map<string, PermissionResourceGroup>();
    flatPermissions.forEach((permission) => {
      const resource = permission.resource || '未分组';
      const group = groups.get(resource) || {
        resource,
        count: 0,
        activeCount: 0,
      };
      group.count += 1;
      if (permission.active) group.activeCount += 1;
      groups.set(resource, group);
    });
    return Array.from(groups.values()).sort((first, second) =>
      first.resource.localeCompare(second.resource)
    );
  }, [flatPermissions]);

  const selectedScopeName = permissionFilters.resource
    ? resourceGroups.find((group) => group.resource === permissionFilters.resource)?.resource ||
      permissionFilters.resource
    : '全部权限';

  const parentOptions = useMemo(
    () =>
      flatPermissions
        .filter((permission) => permission.id !== editingPermission?.id)
        .map((permission) => ({
          label: `${'　'.repeat(permission.depth)}${permission.name}`,
          value: permission.id,
        })),
    [editingPermission?.id, flatPermissions]
  );

  const refreshPermissions = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['permission-management-list'] }),
      queryClient.invalidateQueries({ queryKey: ['permission-management-tree'] }),
    ]);
  };

  const savePermissionMutation = useMutation({
    mutationFn: (values: PermissionFormValues) => {
      const basePayload = {
        name: values.name?.trim() || '',
        description: values.description?.trim() || undefined,
        resource: values.resource?.trim() || '',
        action: values.action?.trim() || '',
        type: values.type || 'API',
        parentId: values.parentId || undefined,
        level: values.level ?? 1,
        sortOrder: values.sortOrder ?? 0,
        active: values.active ?? true,
      };

      if (permissionModalMode === 'edit' && editingPermission) {
        const updatePayload: UpdatePermission = basePayload;
        return permissionManagementApi.updatePermission(editingPermission.id, updatePayload);
      }

      const createPayload: CreatePermission = {
        ...basePayload,
        code: values.code?.trim() || '',
      };
      return permissionManagementApi.createPermission(createPayload);
    },
    onSuccess: async () => {
      message.success(permissionModalMode === 'edit' ? '权限已更新' : '权限已创建');
      setPermissionModalOpen(false);
      setEditingPermission(null);
      permissionForm.resetFields();
      await refreshPermissions();
    },
    onError: () => {
      message.error(permissionModalMode === 'edit' ? '更新权限失败' : '创建权限失败');
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (permissionId: string) => permissionManagementApi.deletePermission(permissionId),
    onSuccess: async () => {
      message.success('权限已删除');
      await refreshPermissions();
    },
    onError: () => {
      message.error('删除权限失败');
    },
  });

  const saveDataRuleMutation = useMutation({
    mutationFn: (values: DataRuleFormValues) => {
      const basePayload = {
        name: values.name?.trim() || '',
        description: values.description?.trim() || undefined,
        resource: values.resource?.trim() || '',
        condition: values.condition?.trim() || '',
        active: values.active ?? true,
      };

      if (dataRuleModalMode === 'edit' && editingDataRule) {
        const updatePayload: UpdateDataPermissionRule = basePayload;
        return permissionManagementApi.updateDataRule(editingDataRule.id, updatePayload);
      }

      const createPayload: CreateDataPermissionRule = {
        ...basePayload,
        code: values.code?.trim() || '',
      };
      return permissionManagementApi.createDataRule(createPayload);
    },
    onSuccess: async () => {
      message.success(dataRuleModalMode === 'edit' ? '数据规则已更新' : '数据规则已创建');
      setDataRuleModalOpen(false);
      setEditingDataRule(null);
      dataRuleForm.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['permission-management-data-rules'] });
    },
    onError: () => {
      message.error(dataRuleModalMode === 'edit' ? '更新数据规则失败' : '创建数据规则失败');
    },
  });

  const deleteDataRuleMutation = useMutation({
    mutationFn: (ruleId: string) => permissionManagementApi.deleteDataRule(ruleId),
    onSuccess: async () => {
      message.success('数据规则已删除');
      await queryClient.invalidateQueries({ queryKey: ['permission-management-data-rules'] });
    },
    onError: () => {
      message.error('删除数据规则失败');
    },
  });

  const handlePermissionFilterChange = (field: keyof PermissionFilters, value: unknown) => {
    setPermissionFilters((prev) => ({
      ...prev,
      [field]: value === '' || value === null ? undefined : value,
      page: 1,
    }));
  };

  const handleDataRuleFilterChange = (field: keyof DataRuleFilters, value: unknown) => {
    setDataRuleFilters((prev) => ({
      ...prev,
      [field]: value === '' || value === null ? undefined : value,
      page: 1,
    }));
  };

  const openCreatePermission = (parentId?: string) => {
    setPermissionModalMode('create');
    setEditingPermission(null);
    permissionForm.setFieldsValue({
      name: '',
      code: '',
      description: '',
      resource: permissionFilters.resource || '',
      action: '',
      type: 'API',
      parentId,
      level: parentId ? 2 : 1,
      sortOrder: 0,
      active: true,
    });
    setPermissionModalOpen(true);
  };

  const openEditPermission = (permission: PermissionItem) => {
    setPermissionModalMode('edit');
    setEditingPermission(permission);
    permissionForm.setFieldsValue({
      name: permission.name,
      code: permission.code,
      description: displayNullableText(permission.description),
      resource: permission.resource,
      action: permission.action,
      type: permission.type,
      parentId: displayString(permission.parentId) || undefined,
      level: permission.level,
      sortOrder: permission.sortOrder,
      active: permission.active,
    });
    setPermissionModalOpen(true);
  };

  const openCreateDataRule = () => {
    setDataRuleModalMode('create');
    setEditingDataRule(null);
    dataRuleForm.setFieldsValue({
      name: '',
      code: '',
      description: '',
      resource: '',
      condition: '{\n  \n}',
      active: true,
    });
    setDataRuleModalOpen(true);
  };

  const openEditDataRule = (rule: DataPermissionRule) => {
    setDataRuleModalMode('edit');
    setEditingDataRule(rule);
    dataRuleForm.setFieldsValue({
      name: rule.name,
      code: rule.code,
      description: displayNullableText(rule.description),
      resource: rule.resource,
      condition: rule.condition,
      active: rule.active,
    });
    setDataRuleModalOpen(true);
  };

  const permissionColumns: TableProps<PermissionItem>['columns'] = [
    {
      title: '权限名称',
      key: 'name',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <SafetyCertificateOutlined />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      ellipsis: true,
      render: (code: string) => <span className="permission-code">{code}</span>,
    },
    {
      title: '资源/动作',
      key: 'resource',
      width: 170,
      render: (_, record) => (
        <Space size={4}>
          <Tag>{record.resource}</Tag>
          <Text type="secondary">{record.action}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 96,
      render: (type: string) => {
        const meta = getPermissionTypeMeta(type);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 76,
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      width: 90,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>{active ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: unknown) => (
        <span className="permission-description">{displayNullableText(description) || '-'}</span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Perm permission={PERMISSIONS.PERMISSION.UPDATE}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditPermission(record)}
            >
              编辑
            </Button>
          </Perm>
          <Perm permission={PERMISSIONS.PERMISSION.DELETE}>
            <Popconfirm
              title="确定删除该权限吗？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => deletePermissionMutation.mutate(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Perm>
        </Space>
      ),
    },
  ];

  const dataRuleColumns: TableProps<DataPermissionRule>['columns'] = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string) => (
        <Space size="small">
          <DatabaseOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '规则编码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      ellipsis: true,
      render: (code: string) => <span className="permission-code">{code}</span>,
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 130,
      render: (resource: string) => <Tag>{resource}</Tag>,
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      ellipsis: true,
      render: (condition: string) => <span className="permission-condition">{condition}</span>,
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      width: 90,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>{active ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Perm permission={PERMISSIONS.PERMISSION.UPDATE}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditDataRule(record)}
            >
              编辑
            </Button>
          </Perm>
          <Perm permission={PERMISSIONS.PERMISSION.DELETE}>
            <Popconfirm
              title="确定删除该数据规则吗？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => deleteDataRuleMutation.mutate(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Perm>
        </Space>
      ),
    },
  ];

  const renderPermissionGroups = () => {
    if (permissionTreeQuery.isLoading) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="分组加载中" />;
    }

    if (!resourceGroups.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无权限" />;
    }

    return (
      <>
        <button
          type="button"
          className={`permission-tree-node${!permissionFilters.resource ? ' is-active' : ''}`}
          onClick={() => handlePermissionFilterChange('resource', undefined)}
        >
          <ApartmentOutlined />
          <span className="permission-tree-node-name">
            <span>全部权限</span>
            <span className="permission-resource-meta">{flatPermissions.length} 项权限</span>
          </span>
        </button>
        {resourceGroups.map((group) => {
          const active = permissionFilters.resource === group.resource;
          return (
            <button
              key={group.resource}
              type="button"
              className={`permission-tree-node${active ? ' is-active' : ''}`}
              onClick={() => handlePermissionFilterChange('resource', group.resource)}
            >
              <DatabaseOutlined />
              <span className="permission-tree-node-name">
                <span>{group.resource}</span>
                <span className="permission-resource-meta">{group.activeCount} 项启用</span>
              </span>
              <Tag>{group.count}</Tag>
            </button>
          );
        })}
      </>
    );
  };

  const renderPermissionToolbar = () => (
    <div className="permission-toolbar">
      <div className="permission-filters">
        <Input
          allowClear
          className="permission-search"
          prefix={<SearchOutlined />}
          placeholder="搜索权限名称"
          value={permissionFilters.name}
          onChange={(event) => handlePermissionFilterChange('name', event.target.value)}
        />
        <Input
          allowClear
          className="permission-code-input"
          placeholder="权限编码"
          value={permissionFilters.code}
          onChange={(event) => handlePermissionFilterChange('code', event.target.value)}
        />
        <Input
          allowClear
          className="permission-resource-input"
          placeholder="资源标识"
          value={permissionFilters.resource}
          onChange={(event) => handlePermissionFilterChange('resource', event.target.value)}
        />
        <Select
          allowClear
          style={{ width: 128 }}
          placeholder="权限类型"
          value={permissionFilters.type}
          onChange={(value) => handlePermissionFilterChange('type', value)}
          options={PERMISSION_TYPE_OPTIONS.map(({ label, value }) => ({ label, value }))}
        />
        <Select
          allowClear
          style={{ width: 112 }}
          placeholder="状态"
          value={permissionFilters.active}
          onChange={(value) => handlePermissionFilterChange('active', value)}
          options={[
            { label: '启用', value: true },
            { label: '停用', value: false },
          ]}
        />
      </div>
      <Space size="small" wrap>
        <Tooltip title="刷新">
          <Button
            icon={<ReloadOutlined />}
            loading={permissionListQuery.isFetching || permissionTreeQuery.isFetching}
            onClick={refreshPermissions}
          />
        </Tooltip>
        <Perm permission={PERMISSIONS.PERMISSION.CREATE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreatePermission()}>
            新建权限
          </Button>
        </Perm>
      </Space>
    </div>
  );

  const renderDataRuleToolbar = () => (
    <div className="permission-toolbar">
      <div className="permission-filters">
        <Input
          allowClear
          className="permission-search"
          prefix={<SearchOutlined />}
          placeholder="搜索规则名称"
          value={dataRuleFilters.name}
          onChange={(event) => handleDataRuleFilterChange('name', event.target.value)}
        />
        <Input
          allowClear
          className="permission-code-input"
          placeholder="规则编码"
          value={dataRuleFilters.code}
          onChange={(event) => handleDataRuleFilterChange('code', event.target.value)}
        />
        <Input
          allowClear
          className="permission-resource-input"
          placeholder="资源标识"
          value={dataRuleFilters.resource}
          onChange={(event) => handleDataRuleFilterChange('resource', event.target.value)}
        />
        <Select
          allowClear
          style={{ width: 112 }}
          placeholder="状态"
          value={dataRuleFilters.active}
          onChange={(value) => handleDataRuleFilterChange('active', value)}
          options={[
            { label: '启用', value: true },
            { label: '停用', value: false },
          ]}
        />
      </div>
      <Space size="small" wrap>
        <Tooltip title="刷新">
          <Button
            icon={<ReloadOutlined />}
            loading={dataRuleListQuery.isFetching}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['permission-management-data-rules'] })
            }
          />
        </Tooltip>
        <Perm permission={PERMISSIONS.PERMISSION.CREATE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDataRule}>
            新建数据规则
          </Button>
        </Perm>
      </Space>
    </div>
  );

  const renderPermissions = () => (
    <div className="permission-content-shell">
      <aside className="permission-tree-pane">
        <div className="permission-tree-title">
          <span>资源分组</span>
          <Text type="secondary">{resourceGroups.length}</Text>
        </div>
        <div className="permission-tree-list">{renderPermissionGroups()}</div>
      </aside>
      <main className="permission-table-pane">
        {renderPermissionToolbar()}
        <Table
          columns={permissionColumns}
          dataSource={permissionListQuery.data?.data || []}
          rowKey="id"
          loading={permissionListQuery.isLoading}
          expandable={{ showExpandColumn: false }}
          pagination={{
            current: permissionFilters.page,
            pageSize: permissionFilters.pageSize,
            total: permissionListQuery.data?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1120 }}
          onChange={(pagination) =>
            setPermissionFilters((prev) => ({
              ...prev,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            }))
          }
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无权限" />,
          }}
        />
      </main>
    </div>
  );

  const renderDataRules = () => (
    <>
      {renderDataRuleToolbar()}
      <Table
        columns={dataRuleColumns}
        dataSource={dataRuleListQuery.data?.data || []}
        rowKey="id"
        loading={dataRuleListQuery.isLoading}
        pagination={{
          current: dataRuleFilters.page,
          pageSize: dataRuleFilters.pageSize,
          total: dataRuleListQuery.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 980 }}
        onChange={(pagination) =>
          setDataRuleFilters((prev) => ({
            ...prev,
            page: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
          }))
        }
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据规则" />,
        }}
      />
    </>
  );

  return (
    <div className="permission-management-page">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ActiveTab)}
        tabBarExtraContent={
          <div className="permission-tab-summary">
            <span>当前范围：{selectedScopeName}</span>
            <span>权限项 {permissionListQuery.data?.total || 0}</span>
            <span>数据规则 {dataRuleListQuery.data?.total || 0}</span>
          </div>
        }
        items={[
          { key: 'permissions', label: '权限项', children: renderPermissions() },
          { key: 'dataRules', label: '数据规则', children: renderDataRules() },
        ]}
      />

      <Modal
        title={permissionModalMode === 'edit' ? '编辑权限' : '新建权限'}
        open={permissionModalOpen}
        onOk={() =>
          permissionForm.validateFields().then((values) => savePermissionMutation.mutate(values))
        }
        onCancel={() => {
          setPermissionModalOpen(false);
          setEditingPermission(null);
          permissionForm.resetFields();
        }}
        confirmLoading={savePermissionMutation.isPending}
        okText="保存"
        cancelText="取消"
        width={680}
        destroyOnHidden
      >
        <Form form={permissionForm} layout="vertical">
          <div className="permission-form-section">权限信息</div>
          <Form.Item
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          <Form.Item
            label="权限编码"
            name="code"
            rules={[{ required: permissionModalMode === 'create', message: '请输入权限编码' }]}
          >
            <Input disabled={permissionModalMode === 'edit'} placeholder="例如 user:read" />
          </Form.Item>
          <Space size="middle" style={{ width: '100%' }} align="start">
            <Form.Item
              label="资源标识"
              name="resource"
              rules={[{ required: true, message: '请输入资源标识' }]}
            >
              <Input placeholder="例如 user" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="操作类型"
              name="action"
              rules={[{ required: true, message: '请输入操作类型' }]}
            >
              <Input placeholder="例如 read" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="权限类型"
              name="type"
              rules={[{ required: true, message: '请选择权限类型' }]}
            >
              <Select
                style={{ width: 160 }}
                options={PERMISSION_TYPE_OPTIONS.map(({ label, value }) => ({ label, value }))}
              />
            </Form.Item>
          </Space>
          <Form.Item label="父权限" name="parentId">
            <Select
              allowClear
              showSearch={{ optionFilterProp: 'label' }}
              placeholder="请选择父权限"
              options={parentOptions}
            />
          </Form.Item>
          <Space size="middle" style={{ width: '100%' }} align="start">
            <Form.Item label="权限层级" name="level">
              <InputNumber min={1} max={20} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item label="排序" name="sortOrder">
              <InputNumber min={0} max={9999} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item label="启用状态" name="active" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
          </Space>
          <Form.Item label="权限说明" name="description">
            <TextArea rows={3} placeholder="请输入权限说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={dataRuleModalMode === 'edit' ? '编辑数据规则' : '新建数据规则'}
        open={dataRuleModalOpen}
        onOk={() =>
          dataRuleForm.validateFields().then((values) => saveDataRuleMutation.mutate(values))
        }
        onCancel={() => {
          setDataRuleModalOpen(false);
          setEditingDataRule(null);
          dataRuleForm.resetFields();
        }}
        confirmLoading={saveDataRuleMutation.isPending}
        okText="保存"
        cancelText="取消"
        width={680}
        destroyOnHidden
      >
        <Form form={dataRuleForm} layout="vertical">
          <div className="permission-form-section">规则信息</div>
          <Form.Item
            label="规则名称"
            name="name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item
            label="规则编码"
            name="code"
            rules={[{ required: dataRuleModalMode === 'create', message: '请输入规则编码' }]}
          >
            <Input disabled={dataRuleModalMode === 'edit'} placeholder="例如 dept_only" />
          </Form.Item>
          <Form.Item
            label="资源标识"
            name="resource"
            rules={[{ required: true, message: '请输入资源标识' }]}
          >
            <Input placeholder="例如 user" />
          </Form.Item>
          <Form.Item
            label="权限条件"
            name="condition"
            rules={[
              { required: true, message: '请输入权限条件' },
              {
                validator: (_, value: string | undefined) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error('请输入有效的 JSON 条件'));
                  }
                },
              },
            ]}
          >
            <TextArea
              rows={6}
              className="permission-code"
              placeholder='例如 {"departmentId":"${user.departmentId}"}'
            />
          </Form.Item>
          <Form.Item label="启用状态" name="active" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item label="规则说明" name="description">
            <TextArea rows={3} placeholder="请输入规则说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
