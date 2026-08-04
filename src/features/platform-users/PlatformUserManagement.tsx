import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Popconfirm from 'antd/es/popconfirm';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import type { TableProps } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  platformUserApi,
  type PlatformUser,
  type PlatformUserDetail,
  type PlatformUserListParams,
  type UpdatePlatformUser,
  type LocalUserOption,
} from './api/platformUserApi';
import './PlatformUserManagement.css';

const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────

type PlatformEnum =
  | 'FEISHU'
  | 'TENCENT_MEETING'
  | 'WECHAT'
  | 'DINGTALK'
  | 'ZOOM'
  | 'SLACK'
  | 'TEAMS';

const PLATFORM_LABELS: Record<PlatformEnum, { label: string; color: string }> = {
  FEISHU: { label: '飞书', color: '#3370ff' },
  TENCENT_MEETING: { label: '腾讯会议', color: '#07c160' },
  WECHAT: { label: '微信', color: '#07c160' },
  DINGTALK: { label: '钉钉', color: '#ff6a00' },
  ZOOM: { label: 'Zoom', color: '#2d8cff' },
  SLACK: { label: 'Slack', color: '#4a154b' },
  TEAMS: { label: 'Teams', color: '#464eb8' },
};

interface EditFormValues {
  displayName?: string;
  countryCode?: string;
  phone?: string;
  active?: boolean;
  localUserId?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const PLATFORM_USER_LIST_KEY = 'platform-users-list';

// ─── Component ────────────────────────────────────────────────────────────────

export function PlatformUserManagement() {
  const queryClient = useQueryClient();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<PlatformUserListParams>({
    page: 1,
    pageSize: 20,
  });

  // ── Drawer / Modal state ──────────────────────────────────────────────────
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<PlatformUser | null>(null);
  const [editForm] = Form.useForm<EditFormValues>();

  const [localUsers, setLocalUsers] = useState<LocalUserOption[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isFetching } = useQuery({
    queryKey: [PLATFORM_USER_LIST_KEY, filters],
    queryFn: () => platformUserApi.list(filters),
    placeholderData: (prev) => prev,
  });

  const { data: detailData, isFetching: detailLoading } = useQuery({
    queryKey: ['platform-user-detail', detailId],
    queryFn: () => platformUserApi.getById(detailId!),
    enabled: !!detailId,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: [PLATFORM_USER_LIST_KEY] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlatformUser }) =>
      platformUserApi.update(id, data),
    onSuccess: () => {
      void message.success('更新成功');
      setEditTarget(null);
      editForm.resetFields();
      void invalidateList();
    },
    onError: () => void message.error('更新失败'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => platformUserApi.activate(id),
    onSuccess: () => {
      void message.success('已激活');
      void invalidateList();
    },
    onError: () => void message.error('操作失败'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => platformUserApi.deactivate(id),
    onSuccess: () => {
      void message.success('已停用');
      void invalidateList();
    },
    onError: () => void message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformUserApi.delete(id),
    onSuccess: () => {
      void message.success('已删除');
      void invalidateList();
    },
    onError: () => void message.error('删除失败'),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (keyword: string) =>
    setFilters((f) => ({ ...f, keyword: keyword || undefined, page: 1 }));

  const handlePlatformChange = (val: PlatformEnum | undefined) =>
    setFilters((f) => ({ ...f, platform: val, page: 1 }));

  const handleActiveChange = (val: boolean | undefined) =>
    setFilters((f) => ({ ...f, active: val, page: 1 }));

  const fetchLocalUsers = (keyword: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!keyword) {
      setLocalUsers([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSearchingUsers(true);
      platformUserApi
        .searchLocalUsers(keyword)
        .then((data) => setLocalUsers(data))
        .catch(() => message.error('搜索本地用户失败'))
        .finally(() => setSearchingUsers(false));
    }, 500);
    setSearchTimeout(timeout);
  };

  const openEdit = (record: PlatformUser) => {
    setEditTarget(record);
    editForm.setFieldsValue({
      displayName: record.displayName,
      phone: record.phone,
      countryCode: record.countryCode,
      active: record.active,
      localUserId: record.localUserId,
    });
    if (record.localUserId) {
      fetchLocalUsers(record.localUserId);
    } else {
      setLocalUsers([]);
    }
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then((vals) => {
      if (!editTarget) return;

      const payload: UpdatePlatformUser = { ...vals };
      if (vals.localUserId === undefined && 'localUserId' in vals) {
        // If it was cleared, it might be undefined in vals, but we should send null to backend to unlink
        payload.localUserId = null as unknown as string;
      }

      updateMutation.mutate({ id: editTarget.id, data: payload });
    });
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: TableProps<PlatformUser>['columns'] = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 130,
      render: (platform: PlatformEnum) => {
        const info = PLATFORM_LABELS[platform] ?? { label: platform, color: '#8f959e' };
        return (
          <Tag color={info.color} style={{ margin: 0 }}>
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: '显示名称',
      key: 'displayName',
      width: 160,
      render: (_: unknown, record: PlatformUser) => (
        <button className="platform-user-name-cell" onClick={() => setDetailId(record.id)}>
          <Avatar size={28} icon={<UserOutlined />} />
          <span>{record.displayName ?? '—'}</span>
        </button>
      ),
    },
    {
      title: '平台联合 ID',
      dataIndex: 'ptUnionId',
      key: 'ptUnionId',
      width: 200,
      ellipsis: true,
      render: (val: string) => (
        <Tooltip title={val}>
          <Text copyable style={{ fontSize: 12, color: '#646a73' }}>
            {val}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '手机号',
      key: 'phone',
      width: 140,
      render: (_: unknown, record: PlatformUser) =>
        record.phone ? `${record.countryCode ?? ''} ${record.phone}` : '—',
    },
    {
      title: '本地用户',
      key: 'localUserId',
      width: 140,
      render: (_: unknown, record: PlatformUser) =>
        record.localUserId ? (
          <Tooltip title={record.localUserId}>
            <Tag icon={<LinkOutlined />} color="blue" style={{ margin: 0 }}>
              已关联
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="default" style={{ margin: 0 }}>
            未关联
          </Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      width: 90,
      render: (active: boolean) =>
        active ? (
          <Tag color="success" style={{ margin: 0 }}>
            活跃
          </Tag>
        ) : (
          <Tag color="default" style={{ margin: 0 }}>
            停用
          </Tag>
        ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastSeenAt',
      key: 'lastSeenAt',
      width: 150,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_: unknown, record: PlatformUser) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailId(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          {record.active ? (
            <Tooltip title="停用">
              <Popconfirm
                title="确定停用此平台用户？"
                onConfirm={() => deactivateMutation.mutate(record.id)}
                okType="danger"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<PauseCircleOutlined />}
                  loading={deactivateMutation.isPending}
                />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="激活">
              <Popconfirm
                title="确定激活此平台用户？"
                onConfirm={() => activateMutation.mutate(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  loading={activateMutation.isPending}
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Popconfirm
              title="确定删除此平台用户？此操作不可撤销。"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okType="danger"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="platform-users-page">
      {/* Toolbar */}
      <div className="platform-users-toolbar">
        <div className="platform-users-filters">
          <Search
            placeholder="搜索显示名称 / 手机号"
            allowClear
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Select<PlatformEnum | undefined>
            allowClear
            placeholder="平台类型"
            style={{ width: 150 }}
            onChange={handlePlatformChange}
          >
            {Object.entries(PLATFORM_LABELS).map(([key, val]) => (
              <Option key={key} value={key}>
                {val.label}
              </Option>
            ))}
          </Select>
          <Select<boolean | undefined>
            allowClear
            placeholder="活跃状态"
            style={{ width: 120 }}
            onChange={handleActiveChange}
          >
            <Option value={true}>活跃</Option>
            <Option value={false}>停用</Option>
          </Select>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void invalidateList()}
          loading={isFetching}
        >
          刷新
        </Button>
      </div>

      {/* Table */}
      <Table<PlatformUser>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isFetching}
        scroll={{ x: 1200 }}
        pagination={{
          current: filters.page ?? 1,
          pageSize: filters.pageSize ?? 20,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => setFilters((f) => ({ ...f, page, pageSize })),
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        className="platform-user-detail-drawer"
        title={null}
        placement="right"
        width={480}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        destroyOnClose
      >
        <DetailPanel detail={detailData ?? null} loading={detailLoading} />
      </Drawer>

      {/* Edit Modal */}
      <Modal
        title="编辑平台用户"
        open={!!editTarget}
        onCancel={() => {
          setEditTarget(null);
          editForm.resetFields();
        }}
        onOk={handleEditSubmit}
        confirmLoading={updateMutation.isPending}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          className="platform-user-edit-form"
          style={{ padding: 0, paddingTop: 16 }}
        >
          <Form.Item label="显示名称" name="displayName">
            <Input placeholder="请输入显示名称" />
          </Form.Item>
          <Form.Item label="国家代码" name="countryCode">
            <Input placeholder="如 +86" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="关联本地用户" name="localUserId">
            <Select
              showSearch
              allowClear
              placeholder="搜索并选择本地用户"
              filterOption={false}
              onSearch={fetchLocalUsers}
              notFoundContent={searchingUsers ? '搜索中...' : '无匹配结果'}
              options={localUsers.map((u) => ({
                value: u.id,
                label: `${u.profile?.displayName || u.username || ''} (${u.email || u.phone || u.id})`,
              }))}
            />
          </Form.Item>
          <Form.Item label="状态" name="active">
            <Select>
              <Option value={true}>活跃</Option>
              <Option value={false}>停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ detail, loading }: { detail: PlatformUserDetail | null; loading: boolean }) {
  if (loading || !detail) {
    return (
      <div className="platform-user-detail">
        <Typography.Text type="secondary">加载中...</Typography.Text>
      </div>
    );
  }

  const platform = detail.platform as PlatformEnum;
  const platformInfo = PLATFORM_LABELS[platform] ?? { label: platform, color: '#8f959e' };

  return (
    <div className="platform-user-detail">
      {/* Header */}
      <div className="platform-user-detail-header">
        <Avatar size={52} icon={<UserOutlined />} />
        <div className="platform-user-detail-title">
          <Title level={5}>{detail.displayName ?? '—'}</Title>
          <Tag color={platformInfo.color}>{platformInfo.label}</Tag>
        </div>
      </div>

      {/* Basic Info */}
      <div className="platform-user-section-title">基本信息</div>
      <div className="platform-user-detail-fields">
        <FieldRow label="记录 ID" value={detail.id} copyable />
        <FieldRow label="平台联合 ID" value={detail.ptUnionId} copyable />
        <FieldRow label="平台用户 ID" value={detail.ptUserId} />
        <FieldRow
          label="手机号"
          value={detail.phone ? `${detail.countryCode ?? ''} ${detail.phone}` : undefined}
        />
        <FieldRow
          label="状态"
          value={detail.active ? <Tag color="success">活跃</Tag> : <Tag color="default">停用</Tag>}
        />
        <FieldRow
          label="最后活跃"
          value={
            detail.lastSeenAt ? dayjs(detail.lastSeenAt).format('YYYY-MM-DD HH:mm:ss') : undefined
          }
        />
        <FieldRow label="创建时间" value={dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss')} />
      </div>

      {/* Linked User */}
      {detail.user && (
        <>
          <div className="platform-user-section-title" style={{ marginTop: 24 }}>
            关联本地用户
          </div>
          <div className="platform-user-linked-card">
            <Avatar size={40} src={detail.user.profile?.avatar} icon={<UserOutlined />} />
            <div className="platform-user-linked-info">
              <Text strong>{detail.user.profile?.displayName ?? detail.user.username ?? '—'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {detail.user.email ?? '无邮箱'}
              </Text>
              {detail.user.id && (
                <Text
                  copyable={{ text: detail.user.id }}
                  style={{ fontSize: 11, color: '#8f959e' }}
                >
                  {detail.user.id}
                </Text>
              )}
            </div>
          </div>
        </>
      )}

      {!detail.user && (
        <>
          <div className="platform-user-section-title" style={{ marginTop: 24 }}>
            关联本地用户
          </div>
          <Tag color="default" icon={<UserOutlined />}>
            未关联本地用户
          </Tag>
        </>
      )}
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value?: React.ReactNode;
  copyable?: boolean;
}) {
  return (
    <div className="platform-user-detail-field">
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      {value === undefined || value === null ? (
        <Text type="secondary">—</Text>
      ) : copyable && typeof value === 'string' ? (
        <Text copyable>{value}</Text>
      ) : (
        <Text>{value as React.ReactNode}</Text>
      )}
    </div>
  );
}
