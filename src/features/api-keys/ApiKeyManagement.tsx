import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import type { TableProps } from 'antd/es/table';
import { Perm } from '../../app/guards/Perm';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { useState } from 'react';
import {
  useTableQuery,
  useTableMutation,
  type TableQueryParams,
} from '../../shared/hooks/useTableQuery';
import { apiKeyApi } from './api/apiKeyApi';
import type { ApiKey, UpdateApiKey, CreateApiKeyResult } from './types';
import { CreateApiKeyModal } from './components/CreateApiKeyModal';
import { EditApiKeyModal } from './components/EditApiKeyModal';
import { KeyOutlined, RotateRightOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

export function ApiKeyManagement() {
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    status: undefined,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [createResult, setCreateResult] = useState<CreateApiKeyResult | undefined>(undefined);

  const {
    data: apiKeyList,
    isLoading,
    refetch,
  } = useTableQuery<ApiKey>({
    queryKey: 'api-keys',
    queryFn: apiKeyApi.list,
    params: filters,
  });

  const createMutation = useTableMutation({
    queryKey: 'api-keys',
    mutationFn: apiKeyApi.create,
    onSuccess: (result: CreateApiKeyResult) => {
      message.success('创建 API Key 成功');
      setCreateResult(result);
    },
    onError: () => {
      message.error('创建 API Key 失败');
    },
  });

  const updateMutation = useTableMutation({
    queryKey: 'api-keys',
    mutationFn: ({ id, data }: { id: string; data: UpdateApiKey }) => apiKeyApi.update(id, data),
    onSuccess: () => {
      message.success('更新 API Key 成功');
      setEditModalOpen(false);
      setEditingKey(null);
    },
    onError: () => {
      message.error('更新 API Key 失败');
    },
  });

  const revokeMutation = useTableMutation({
    queryKey: 'api-keys',
    mutationFn: apiKeyApi.revoke,
    onSuccess: () => {
      message.success('撤销 API Key 成功');
    },
    onError: () => {
      message.error('撤销 API Key 失败');
    },
  });

  const rotateMutation = useTableMutation({
    queryKey: 'api-keys',
    mutationFn: apiKeyApi.rotate,
    onSuccess: () => {
      message.success('轮换 API Key 成功');
    },
    onError: () => {
      message.error('轮换 API Key 失败');
    },
  });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (record: ApiKey) => {
    setEditingKey(record);
    setEditModalOpen(true);
  };

  const handleRevoke = (record: ApiKey) => {
    revokeMutation.mutate(record.id);
  };

  const handleRotate = (record: ApiKey) => {
    rotateMutation.mutate(record.id);
  };

  const handleSearch = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleTableChange: TableProps<ApiKey>['onChange'] = (pagination, _filters, sorter) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: Array.isArray(sorter)
        ? String(sorter[0].field)
        : sorter.field
          ? String(sorter.field)
          : undefined,
      sortOrder: (Array.isArray(sorter) ? sorter[0].order : sorter.order) || undefined,
    }));
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '活跃' },
      revoked: { color: 'red', text: '已撤销' },
      expired: { color: 'orange', text: '已过期' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'API Key',
      key: 'apiKey',
      render: (_: unknown, record: ApiKey) => (
        <Space>
          <span style={{ fontFamily: 'monospace' }}>
            {record.prefix}****{record.last4}
          </span>
        </Space>
      ),
    },
    {
      title: '权限范围',
      dataIndex: 'scopes',
      key: 'scopes',
      render: (scopes: string[]) => (
        <Space size={[4, 4]} wrap>
          {scopes?.map((scope) => (
            <Tag key={scope} color="blue">
              {scope}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '活跃', value: 'active' },
        { text: '已撤销', value: 'revoked' },
        { text: '已过期', value: 'expired' },
      ],
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string | null) => {
        if (!expiresAt) return <span style={{ color: '#999' }}>永不过期</span>;
        return new Date(expiresAt).toLocaleString('zh-CN');
      },
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (lastUsedAt: string | null) => {
        if (!lastUsedAt) return <span style={{ color: '#999' }}>未使用</span>;
        return new Date(lastUsedAt).toLocaleString('zh-CN');
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApiKey) => (
        <Space size="small">
          <Perm permission={PERMISSIONS.API_KEY.UPDATE}>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.API_KEY.ROTATE}>
            <Tooltip title="轮换 API Key">
              <Button
                type="link"
                size="small"
                icon={<RotateRightOutlined />}
                onClick={() => handleRotate(record)}
                loading={rotateMutation.isPending}
              />
            </Tooltip>
          </Perm>

          <Perm permission={PERMISSIONS.API_KEY.REVOKE}>
            <Popconfirm
              title="确定要撤销此 API Key 吗？"
              description="撤销后该 API Key 将无法再用于认证"
              onConfirm={() => handleRevoke(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger loading={revokeMutation.isPending}>
                撤销
              </Button>
            </Popconfirm>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Perm permission={PERMISSIONS.API_KEY.CREATE}>
          <Button type="primary" icon={<KeyOutlined />} onClick={handleCreate}>
            创建 API Key
          </Button>
        </Perm>

        <Search
          placeholder="搜索名称"
          allowClear
          style={{ width: 200 }}
          onSearch={(value) => handleSearch('name', value)}
          onChange={(e) => !e.target.value && handleSearch('name', '')}
        />

        <Select
          placeholder="选择状态"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('status', value)}
        >
          <Option value="active">活跃</Option>
          <Option value="revoked">已撤销</Option>
          <Option value="expired">已过期</Option>
        </Select>

        <Button onClick={() => refetch()}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={apiKeyList?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: apiKeyList?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <CreateApiKeyModal
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          setCreateResult(undefined);
        }}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
        result={createResult}
        onCopyComplete={() => {
          setCreateModalOpen(false);
          setCreateResult(undefined);
        }}
      />

      {editingKey && (
        <EditApiKeyModal
          open={editModalOpen}
          apiKey={editingKey}
          onCancel={() => {
            setEditModalOpen(false);
            setEditingKey(null);
          }}
          onSubmit={(data) => updateMutation.mutate({ id: editingKey.id, data })}
          loading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
