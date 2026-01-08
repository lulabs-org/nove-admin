import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import type { TableProps } from 'antd/es/table';
import { Perm } from '../../app/guards/Perm';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { useState } from 'react';
import {
  useTableQuery,
  useTableMutation,
  useTableDeleteMutation,
  type TableQueryParams,
} from '../../shared/hooks/useTableQuery';
import { userApi, type User, type UpdateUserDto } from './api/userApi';

const { Search } = Input;
const { Option } = Select;

export function UserManagement() {
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    name: '',
    email: '',
    role: undefined,
    status: undefined,
  });

  const {
    data: userList,
    isLoading,
    refetch,
  } = useTableQuery<User>({
    queryKey: 'users',
    queryFn: userApi.list,
    params: filters,
  });

  const createMutation = useTableMutation({
    queryKey: 'users',
    mutationFn: userApi.create,
    onSuccess: () => {
      message.success('创建用户成功');
    },
    onError: () => {
      message.error('创建用户失败');
    },
  });

  const updateMutation = useTableMutation({
    queryKey: 'users',
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => userApi.update(id, data),
    onSuccess: () => {
      message.success('更新用户成功');
    },
    onError: () => {
      message.error('更新用户失败');
    },
  });

  void createMutation;
  void updateMutation;

  const deleteMutation = useTableDeleteMutation({
    queryKey: 'users',
    mutationFn: userApi.delete,
    onSuccess: () => {
      message.success('删除用户成功');
    },
    onError: () => {
      message.error('删除用户失败');
    },
  });

  const auditMutation = useTableMutation({
    queryKey: 'users',
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      userApi.audit(id, approved),
    onSuccess: () => {
      message.success('审核用户成功');
    },
    onError: () => {
      message.error('审核用户失败');
    },
  });

  const handleCreate = () => {
    message.info('点击了新增用户按钮');
  };

  const handleEdit = (record: User) => {
    message.info(`编辑用户: ${record.name}`);
  };

  const handleDelete = (record: User) => {
    deleteMutation.mutate(record.id);
  };

  const handleAudit = (record: User) => {
    auditMutation.mutate({ id: record.id, approved: true });
  };

  const handleSearch = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleTableChange: TableProps<User>['onChange'] = (pagination, _filters, sorter) => {
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

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: '管理员', value: '管理员' },
        { text: '用户', value: '用户' },
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '正常', value: '正常' },
        { text: '禁用', value: '禁用' },
      ],
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Perm permission={PERMISSIONS.USER.UPDATE}>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.USER.DELETE}>
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger loading={deleteMutation.isPending}>
                删除
              </Button>
            </Popconfirm>
          </Perm>

          <Perm permission={PERMISSIONS.USER.RESET_PASSWORD}>
            <Button
              type="link"
              size="small"
              onClick={() => handleAudit(record)}
              loading={auditMutation.isPending}
            >
              审核
            </Button>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Perm permission={PERMISSIONS.USER.CREATE}>
          <Button type="primary" onClick={handleCreate}>
            新增用户
          </Button>
        </Perm>

        <Search
          placeholder="搜索姓名"
          allowClear
          style={{ width: 200 }}
          onSearch={(value) => handleSearch('name', value)}
          onChange={(e) => !e.target.value && handleSearch('name', '')}
        />

        <Search
          placeholder="搜索邮箱"
          allowClear
          style={{ width: 200 }}
          onSearch={(value) => handleSearch('email', value)}
          onChange={(e) => !e.target.value && handleSearch('email', '')}
        />

        <Select
          placeholder="选择角色"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('role', value)}
        >
          <Option value="管理员">管理员</Option>
          <Option value="用户">用户</Option>
        </Select>

        <Select
          placeholder="选择状态"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('status', value)}
        >
          <Option value="正常">正常</Option>
          <Option value="禁用">禁用</Option>
        </Select>

        <Button onClick={() => refetch()}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={userList?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: userList?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
