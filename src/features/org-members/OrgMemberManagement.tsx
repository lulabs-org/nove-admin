import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Checkbox from 'antd/es/checkbox';
import DatePicker from 'antd/es/date-picker';
import Descriptions from 'antd/es/descriptions';
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
import type { TableProps } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Perm } from '../../app/guards/Perm';
import { useAuth } from '../../shared/hooks/useAuth';
import {
  useTableDeleteMutation,
  useTableMutation,
  useTableQuery,
  type TableQueryParams,
} from '../../shared/hooks/useTableQuery';
import { PERMISSIONS } from '../../shared/utils/permissions';
import {
  orgMemberApi,
  type CreateOrgMember,
  type OrgMember,
  type OrgMemberDetail,
  type OrgMemberListParams,
  type UpdateOrgMember,
  type UpdateOrgMemberDepartments,
} from './api/orgMemberApi';
import type { DepartmentTreeDto, RoleDto } from '../../shared/lib/api/orval/business/schemas';

const { Search } = Input;
const { Option } = Select;

type MemberType = 'INTERNAL' | 'EXTERNAL';
type MemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'LEFT';
type MemberFormMode = 'create' | 'edit';

interface DepartmentOption {
  label: string;
  value: string;
}

interface MemberFormValues {
  userId?: string;
  type?: MemberType;
  orgDisplayName?: string;
  employeeNo?: string;
  primaryDeptId?: string;
  departmentIds?: string[];
  roleIds?: string[];
  externalCompany?: string;
  title?: string;
  joinedAt?: dayjs.Dayjs;
}

const MEMBER_TYPE_OPTIONS: Array<{ label: string; value: MemberType }> = [
  { label: '内部成员', value: 'INTERNAL' },
  { label: '外部成员', value: 'EXTERNAL' },
];

const MEMBER_STATUS_META: Record<MemberStatus, { label: string; color: string }> = {
  INVITED: { label: '已邀请', color: 'processing' },
  ACTIVE: { label: '正常', color: 'success' },
  SUSPENDED: { label: '已停用', color: 'warning' },
  LEFT: { label: '已离职', color: 'default' },
};

function displayString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '';
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', { hour12: false });
}

function getProfileDisplayName(profile: unknown) {
  if (!profile || typeof profile !== 'object') return '';
  return displayString((profile as { displayName?: unknown }).displayName);
}

function getMemberName(member: OrgMember | OrgMemberDetail) {
  return (
    displayString(member.orgDisplayName) ||
    getProfileDisplayName(member.user?.profile) ||
    displayString(member.user?.username) ||
    displayString(member.user?.email) ||
    member.userId
  );
}

function getMemberContact(member: OrgMember | OrgMemberDetail) {
  const email = displayString(member.user?.email);
  const username = displayString(member.user?.username);
  return email || username || '-';
}

function getMemberTypeLabel(type?: string) {
  return MEMBER_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type ?? '-';
}

function getMemberStatusMeta(status?: string) {
  return (
    MEMBER_STATUS_META[(status as MemberStatus) || 'ACTIVE'] ?? {
      label: status || '-',
      color: 'default',
    }
  );
}

function flattenDepartments(tree: DepartmentTreeDto[], depth = 0): DepartmentOption[] {
  return tree.flatMap((dept) => [
    { label: `${'　'.repeat(depth)}${dept.name} (${dept.code})`, value: dept.id },
    ...flattenDepartments(dept.children || [], depth + 1),
  ]);
}

function normalizeDepartmentIds(primaryDeptId?: string, departmentIds?: string[]) {
  const ids = departmentIds ? [...departmentIds] : [];
  if (primaryDeptId && !ids.includes(primaryDeptId)) ids.unshift(primaryDeptId);
  return [...new Set(ids)];
}

export function OrgMemberManagement() {
  const { user } = useAuth();
  const currentOrgId = user?.currentOrgId;
  const queryKey = currentOrgId ? `org-members-${currentOrgId}` : 'org-members-no-org';
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    deptId: undefined,
    includeChildren: false,
    type: undefined,
    status: undefined,
  });
  const [form] = Form.useForm<MemberFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<MemberFormMode>('create');
  const [editingMember, setEditingMember] = useState<OrgMemberDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<OrgMemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    data: memberList,
    isLoading,
    isFetching,
    refetch,
  } = useTableQuery<OrgMember>({
    queryKey,
    queryFn: (params) => {
      if (!currentOrgId) {
        return Promise.resolve({ data: [], total: 0, page: 1, pageSize: params.pageSize || 10 });
      }
      const { sortField, sortOrder, ...queryParams } = params;
      void sortField;
      void sortOrder;
      return orgMemberApi.list(currentOrgId, queryParams as OrgMemberListParams);
    },
    params: filters,
  });

  const { data: departmentTree = [] } = useQuery({
    queryKey: ['org-member-departments', currentOrgId],
    queryFn: () => orgMemberApi.departments(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['org-member-roles'],
    queryFn: orgMemberApi.roles,
  });

  const departmentOptions = useMemo(() => flattenDepartments(departmentTree), [departmentTree]);
  const departmentNameById = useMemo(
    () =>
      new Map(departmentOptions.map((item) => [item.value, item.label.replace(/^\u3000+/, '')])),
    [departmentOptions]
  );

  const createMutation = useTableMutation({
    queryKey,
    mutationFn: (data: CreateOrgMember) => orgMemberApi.create(currentOrgId!, data),
    onSuccess: () => {
      message.success('新增成员成功');
      closeModal();
    },
    onError: () => {
      message.error('新增成员失败');
    },
  });

  const updateMutation = useTableMutation({
    queryKey,
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateOrgMember }) =>
      orgMemberApi.update(memberId, data),
    onSuccess: () => {
      message.success('更新成员成功');
    },
    onError: () => {
      message.error('更新成员失败');
    },
  });

  const departmentMutation = useTableMutation({
    queryKey,
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateOrgMemberDepartments }) =>
      orgMemberApi.updateDepartments(memberId, data),
    onError: () => {
      message.error('调整成员部门失败');
    },
  });

  const statusMutation = useTableMutation({
    queryKey,
    mutationFn: ({ memberId, status }: { memberId: string; status: MemberStatus }) =>
      orgMemberApi.updateStatus(memberId, { status }),
    onSuccess: () => {
      message.success('成员状态已更新');
    },
    onError: () => {
      message.error('更新成员状态失败');
    },
  });

  const deleteMutation = useTableDeleteMutation({
    queryKey,
    mutationFn: orgMemberApi.delete,
    onSuccess: () => {
      message.success('成员已删除');
    },
    onError: () => {
      message.error('删除成员失败');
    },
  });

  const submitting =
    createMutation.isPending || updateMutation.isPending || departmentMutation.isPending;

  const handleFilterChange = (field: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
      page: 1,
    }));
  };

  const handleTableChange: TableProps<OrgMember>['onChange'] = (pagination, _filters, sorter) => {
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

  const openCreateModal = () => {
    setFormMode('create');
    setEditingMember(null);
    form.setFieldsValue({
      userId: '',
      type: 'INTERNAL',
      orgDisplayName: '',
      employeeNo: '',
      primaryDeptId: undefined,
      departmentIds: [],
      roleIds: [],
      externalCompany: '',
      title: '',
      joinedAt: undefined,
    });
    setModalOpen(true);
  };

  const openEditModal = async (record: OrgMember) => {
    setFormMode('edit');
    setModalOpen(true);
    try {
      const detail = await orgMemberApi.getById(record.id);
      setEditingMember(detail);
      const departmentIds = detail.departments?.map((dept) => dept.id) || [];
      form.setFieldsValue({
        type: detail.type as MemberType,
        orgDisplayName: displayString(detail.orgDisplayName),
        employeeNo: displayString(detail.employeeNo),
        primaryDeptId: displayString(detail.primaryDeptId) || undefined,
        departmentIds,
        externalCompany: displayString(detail.externalCompany),
        title: displayString(detail.title),
        joinedAt: detail.joinedAt ? dayjs(detail.joinedAt) : undefined,
      });
    } catch {
      message.error('获取成员详情失败');
      closeModal();
    }
  };

  const openDetailDrawer = async (record: OrgMember) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await orgMemberApi.getById(record.id);
      setDetailMember(detail);
    } catch {
      message.error('获取成员详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMember(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!currentOrgId) return;

    const values = await form.validateFields();
    const departmentIds = normalizeDepartmentIds(values.primaryDeptId, values.departmentIds);

    if (formMode === 'create') {
      await createMutation.mutateAsync({
        userId: values.userId!,
        type: values.type,
        orgDisplayName: values.orgDisplayName || undefined,
        employeeNo: values.employeeNo || undefined,
        primaryDeptId: values.primaryDeptId || undefined,
        departmentIds,
        roleIds: values.roleIds,
        externalCompany: values.externalCompany || undefined,
        title: values.title || undefined,
      });
      return;
    }

    if (!editingMember) return;

    await updateMutation.mutateAsync({
      memberId: editingMember.id,
      data: {
        type: values.type,
        orgDisplayName: values.orgDisplayName || undefined,
        employeeNo: values.employeeNo || undefined,
        primaryDeptId: values.primaryDeptId || undefined,
        externalCompany: values.externalCompany || undefined,
        title: values.title || undefined,
        joinedAt: values.joinedAt ? values.joinedAt.format('YYYY-MM-DD') : undefined,
      },
    });
    await departmentMutation.mutateAsync({
      memberId: editingMember.id,
      data: {
        primaryDeptId: values.primaryDeptId || undefined,
        departmentIds,
        append: false,
      },
    });
    message.success('成员部门已更新');
    closeModal();
  };

  const columns: TableProps<OrgMember>['columns'] = [
    {
      title: '成员姓名',
      key: 'name',
      render: (_, record) => getMemberName(record),
    },
    {
      title: '邮箱/用户名',
      key: 'contact',
      render: (_, record) => getMemberContact(record),
    },
    {
      title: '成员类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: MemberType) => (
        <Tag color={type === 'INTERNAL' ? 'blue' : 'purple'}>{getMemberTypeLabel(type)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: MemberStatus) => {
        const meta = getMemberStatusMeta(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      render: (value: unknown) => displayString(value) || '-',
    },
    {
      title: '主部门',
      key: 'primaryDept',
      render: (_, record) =>
        record.primaryDept?.name ||
        (record.primaryDeptId ? departmentNameById.get(displayString(record.primaryDeptId)) : '') ||
        '-',
    },
    {
      title: '职位',
      dataIndex: 'title',
      key: 'title',
      render: (value: unknown) => displayString(value) || '-',
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      sorter: true,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(record)}
          >
            查看
          </Button>
          <Perm permission={PERMISSIONS.USER.UPDATE}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              编辑
            </Button>
          </Perm>
          <Perm permission={PERMISSIONS.USER.UPDATE}>
            <Select
              size="small"
              value={record.status as MemberStatus}
              style={{ width: 96 }}
              onChange={(status) =>
                statusMutation.mutate({ memberId: record.id, status: status as MemberStatus })
              }
              disabled={statusMutation.isPending}
            >
              {Object.entries(MEMBER_STATUS_META).map(([status, meta]) => (
                <Option key={status} value={status}>
                  {meta.label}
                </Option>
              ))}
            </Select>
          </Perm>
          <Perm permission={PERMISSIONS.USER.DELETE}>
            <Popconfirm
              title="确定要删除该成员吗？"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              >
                删除
              </Button>
            </Popconfirm>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {!currentOrgId && (
        <Alert
          type="warning"
          showIcon
          message="当前账号未关联组织"
          description="请联系管理员将账号加入组织后再管理组织用户。"
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Perm permission={PERMISSIONS.USER.CREATE}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={openCreateModal}
            disabled={!currentOrgId}
          >
            新增成员
          </Button>
        </Perm>

        <Search
          placeholder="搜索姓名/工号/邮箱"
          allowClear
          style={{ width: 220 }}
          onSearch={(value) => handleFilterChange('keyword', value)}
          onChange={(event) => !event.target.value && handleFilterChange('keyword', '')}
          disabled={!currentOrgId}
        />

        <Select
          placeholder="选择部门"
          allowClear
          showSearch
          optionFilterProp="label"
          options={departmentOptions}
          style={{ width: 220 }}
          onChange={(value) => handleFilterChange('deptId', value)}
          disabled={!currentOrgId}
        />

        <Checkbox
          checked={Boolean(filters.includeChildren)}
          onChange={(event) => handleFilterChange('includeChildren', event.target.checked)}
          disabled={!currentOrgId}
        >
          包含子部门
        </Checkbox>

        <Select
          placeholder="成员类型"
          allowClear
          style={{ width: 130 }}
          onChange={(value) => handleFilterChange('type', value)}
          disabled={!currentOrgId}
        >
          {MEMBER_TYPE_OPTIONS.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="成员状态"
          allowClear
          style={{ width: 130 }}
          onChange={(value) => handleFilterChange('status', value)}
          disabled={!currentOrgId}
        >
          {Object.entries(MEMBER_STATUS_META).map(([status, meta]) => (
            <Option key={status} value={status}>
              {meta.label}
            </Option>
          ))}
        </Select>

        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={memberList?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: memberList?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={formMode === 'create' ? '新增成员' : '编辑成员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={submitting}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {formMode === 'create' && (
            <Form.Item
              label="用户 ID"
              name="userId"
              rules={[{ required: true, message: '请输入已有用户 ID' }]}
            >
              <Input placeholder="输入已有用户 ID" />
            </Form.Item>
          )}

          <Form.Item
            label="成员类型"
            name="type"
            rules={[{ required: true, message: '请选择成员类型' }]}
          >
            <Select>
              {MEMBER_TYPE_OPTIONS.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="组织显示名称" name="orgDisplayName">
            <Input placeholder="成员在组织内显示的名称" />
          </Form.Item>

          <Form.Item label="工号" name="employeeNo">
            <Input placeholder="内部员工工号" />
          </Form.Item>

          <Form.Item label="职位" name="title">
            <Input placeholder="职位/头衔" />
          </Form.Item>

          <Form.Item label="外部公司" name="externalCompany">
            <Input placeholder="外部成员所属公司" />
          </Form.Item>

          <Form.Item label="主部门" name="primaryDeptId">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={departmentOptions}
              placeholder="选择主部门"
            />
          </Form.Item>

          <Form.Item label="所属部门" name="departmentIds">
            <Select
              allowClear
              mode="multiple"
              showSearch
              optionFilterProp="label"
              options={departmentOptions}
              placeholder="选择成员所属部门"
            />
          </Form.Item>

          {formMode === 'create' && (
            <Form.Item label="角色" name="roleIds">
              <Select
                allowClear
                mode="multiple"
                showSearch
                optionFilterProp="label"
                options={roles.map((role: RoleDto) => ({
                  label: `${role.name} (${role.code})`,
                  value: role.id,
                }))}
                placeholder="选择角色"
              />
            </Form.Item>
          )}

          {formMode === 'edit' && (
            <Form.Item label="入职日期" name="joinedAt">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title="成员详情"
        open={detailOpen}
        size="large"
        onClose={() => {
          setDetailOpen(false);
          setDetailMember(null);
        }}
        loading={detailLoading}
      >
        {detailMember && (
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="成员姓名">{getMemberName(detailMember)}</Descriptions.Item>
              <Descriptions.Item label="用户 ID">{detailMember.userId}</Descriptions.Item>
              <Descriptions.Item label="邮箱/用户名">
                {getMemberContact(detailMember)}
              </Descriptions.Item>
              <Descriptions.Item label="成员类型">
                {getMemberTypeLabel(detailMember.type)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getMemberStatusMeta(detailMember.status).color}>
                  {getMemberStatusMeta(detailMember.status).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="工号">
                {displayString(detailMember.employeeNo) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="职位">
                {displayString(detailMember.title) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="外部公司">
                {displayString(detailMember.externalCompany) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="加入时间">
                {formatDateTime(detailMember.joinedAt)}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="部门" bordered column={1} size="small">
              <Descriptions.Item label="主部门">
                {detailMember.primaryDept?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属部门">
                <Space size={[4, 4]} wrap>
                  {detailMember.departments.length
                    ? detailMember.departments.map((dept) => (
                        <Tag key={dept.id} color={dept.isPrimary ? 'blue' : 'default'}>
                          {dept.name}
                        </Tag>
                      ))
                    : '-'}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="角色" bordered column={1} size="small">
              <Descriptions.Item label="已绑定角色">
                <Space size={[4, 4]} wrap>
                  {detailMember.roles.length
                    ? detailMember.roles.map((role) => (
                        <Tag key={role.id} color="purple">
                          {role.name}
                        </Tag>
                      ))
                    : '-'}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
