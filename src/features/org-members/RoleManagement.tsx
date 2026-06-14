import Alert from 'antd/es/alert';
import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import Dropdown from 'antd/es/dropdown';
import Empty from 'antd/es/empty';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Switch from 'antd/es/switch';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import type { MenuProps } from 'antd/es/menu';
import type { TableProps } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type Key } from 'react';
import { Perm } from '../../app/guards/Perm';
import { useAuth } from '../../shared/hooks/useAuth';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { orgMemberApi, type OrgMemberDetail, type OrgMemberListParams } from './api/orgMemberApi';
import {
  roleManagementApi,
  type CreateRole,
  type Role,
  type UpdateRole,
} from './api/roleManagementApi';
import './RoleManagement.css';

const { TextArea } = Input;
const { Text, Title } = Typography;

type RoleModalMode = 'create' | 'edit';

interface RoleFormValues {
  name?: string;
  code?: string;
  description?: string;
  level?: number | null;
  active?: boolean;
}

interface AddMemberFormValues {
  membershipIds?: string[];
}

const ROLE_TYPE_META: Record<string, { label: string; color: string }> = {
  SYSTEM: { label: '系统角色', color: 'blue' },
  CUSTOM: { label: '自定义', color: 'default' },
};

const AVATAR_COLORS = ['#3370ff', '#00a870', '#ff8800', '#7b61ff', '#e65050', '#14a9a0'];

function displayString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '';
}

function getProfileDisplayName(profile: unknown) {
  if (!profile || typeof profile !== 'object') return '';
  return displayString((profile as { displayName?: unknown }).displayName);
}

function getMemberName(member: OrgMemberDetail) {
  return (
    displayString(member.orgDisplayName) ||
    getProfileDisplayName(member.user?.profile) ||
    displayString(member.user?.username) ||
    displayString(member.user?.email) ||
    member.userId
  );
}

function getMemberEmail(member: OrgMemberDetail) {
  return displayString(member.user?.email) || '-';
}

function getAvatarText(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.length > 2 ? trimmed.slice(-2) : trimmed;
}

function getAvatarColor(seed: string) {
  const sum = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getRoleDescription(role?: Role | null) {
  if (!role?.description) return '';
  return typeof role.description === 'string' ? role.description : '';
}

function getDepartmentText(member: OrgMemberDetail) {
  if (member.departments?.length) {
    return member.departments.map((dept) => dept.name).join('、');
  }
  return member.primaryDept?.name || '-';
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell.replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(',')
    )
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function RoleManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentOrgId = user?.currentOrgId;
  const [roleKeyword, setRoleKeyword] = useState('');
  const [memberKeyword, setMemberKeyword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<RoleModalMode>('create');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const [roleForm] = Form.useForm<RoleFormValues>();
  const [addMemberForm] = Form.useForm<AddMemberFormValues>();

  const rolesQuery = useQuery({
    queryKey: ['role-management-roles', roleKeyword],
    queryFn: () =>
      roleManagementApi.list({
        page: 1,
        pageSize: 100,
        name: roleKeyword.trim() || undefined,
      }),
  });

  const membersQuery = useQuery({
    queryKey: ['role-management-members', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      const params: OrgMemberListParams = {
        page: 1,
        pageSize: 500,
        includeChildren: true,
      };
      const result = await orgMemberApi.list(currentOrgId, params);
      const details = await Promise.all(
        result.data.map((member) => orgMemberApi.getById(member.id).catch(() => null))
      );
      return details.filter((member): member is OrgMemberDetail => Boolean(member));
    },
    enabled: !!currentOrgId,
  });

  const roles = rolesQuery.data?.data || [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  const roleMembers = useMemo(() => {
    if (!selectedRole) return [];
    const keyword = memberKeyword.trim().toLowerCase();
    return (membersQuery.data || [])
      .filter((member) => member.roles?.some((role) => role.id === selectedRole.id))
      .filter((member) => {
        if (!keyword) return true;
        const name = getMemberName(member).toLowerCase();
        const email = getMemberEmail(member).toLowerCase();
        return name.includes(keyword) || email.includes(keyword);
      });
  }, [memberKeyword, membersQuery.data, selectedRole]);

  const eligibleMembers = useMemo(() => {
    if (!selectedRole) return [];
    return (membersQuery.data || []).filter(
      (member) => !member.roles?.some((role) => role.id === selectedRole.id)
    );
  }, [membersQuery.data, selectedRole]);

  const saveRoleMutation = useMutation({
    mutationFn: (values: RoleFormValues) => {
      if (!currentOrgId) throw new Error('Missing organization');
      const payload = {
        name: values.name?.trim() || '',
        description: values.description?.trim() || undefined,
        level: values.level ?? 10,
        active: values.active ?? true,
      };

      if (roleModalMode === 'edit' && editingRole) {
        const updatePayload: UpdateRole = payload;
        return roleManagementApi.update(editingRole.id, updatePayload);
      }

      const createPayload: CreateRole = {
        ...payload,
        orgId: currentOrgId,
        code: values.code?.trim() || '',
        type: 'CUSTOM',
      };
      return roleManagementApi.create(createPayload);
    },
    onSuccess: async (role) => {
      message.success(roleModalMode === 'edit' ? '角色已更新' : '角色已新增');
      setRoleModalOpen(false);
      setEditingRole(null);
      roleForm.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['role-management-roles'] });
      setSelectedRoleId(role.id);
    },
    onError: () => {
      message.error(roleModalMode === 'edit' ? '更新角色失败' : '新增角色失败');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => roleManagementApi.delete(roleId),
    onSuccess: async (_, roleId) => {
      message.success('角色已删除');
      if (selectedRoleId === roleId) setSelectedRoleId(undefined);
      await queryClient.invalidateQueries({ queryKey: ['role-management-roles'] });
    },
    onError: () => {
      message.error('删除角色失败');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (values: AddMemberFormValues) => {
      if (!currentOrgId || !selectedRole) throw new Error('Missing role');
      const membershipIds = values.membershipIds || [];
      await Promise.all(
        membershipIds.map((membershipId) =>
          roleManagementApi.bindMember(currentOrgId, {
            roleId: selectedRole.id,
            membershipId,
          })
        )
      );
    },
    onSuccess: async () => {
      message.success('成员已添加到角色');
      setAddMemberOpen(false);
      addMemberForm.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['role-management-members', currentOrgId] });
    },
    onError: () => {
      message.error('添加角色成员失败');
    },
  });

  const handleOpenCreateRole = () => {
    setRoleModalMode('create');
    setEditingRole(null);
    roleForm.setFieldsValue({
      name: '',
      code: '',
      description: '',
      level: 10,
      active: true,
    });
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: Role) => {
    setRoleModalMode('edit');
    setEditingRole(role);
    roleForm.setFieldsValue({
      name: role.name,
      code: role.code,
      description: getRoleDescription(role),
      level: role.level,
      active: role.active,
    });
    setRoleModalOpen(true);
  };

  const handleRoleMenuClick = (key: string, role: Role) => {
    if (key === 'edit') {
      handleOpenEditRole(role);
      return;
    }

    if (key === 'delete') {
      Modal.confirm({
        title: '确定删除该角色吗？',
        content: role.name,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => deleteRoleMutation.mutate(role.id),
      });
    }
  };

  const getRoleMenuItems = (role: Role): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑角色',
      icon: <EditOutlined />,
      disabled: role.type === 'SYSTEM',
    },
    {
      key: 'delete',
      label: '删除角色',
      icon: <DeleteOutlined />,
      danger: true,
      disabled: role.type === 'SYSTEM',
    },
  ];

  const exportMembers = () => {
    if (!selectedRole) return;
    downloadCsv(`${selectedRole.name}-成员.csv`, [
      ['姓名', '电子邮箱', '所属部门', '管理范围'],
      ...roleMembers.map((member) => [
        getMemberName(member),
        getMemberEmail(member),
        getDepartmentText(member),
        '全部',
      ]),
    ]);
  };

  const importExportItems: MenuProps['items'] = [
    {
      key: 'export',
      label: '导出当前角色成员',
      icon: <ExportOutlined />,
    },
    {
      key: 'import',
      label: '批量导入成员',
      icon: <ImportOutlined />,
      disabled: true,
    },
  ];

  const memberColumns: TableProps<OrgMemberDetail>['columns'] = [
    {
      title: '姓名',
      key: 'name',
      width: 130,
      render: (_, record) => {
        const name = getMemberName(record);
        return (
          <span className="org-role-member-name">
            <Avatar
              size={32}
              style={{ backgroundColor: getAvatarColor(record.id) }}
              src={
                displayString((record.user?.profile as { avatar?: unknown } | null)?.avatar) ||
                undefined
              }
            >
              {getAvatarText(name)}
            </Avatar>
            <span>{name}</span>
          </span>
        );
      },
    },
    {
      title: '电子邮箱',
      key: 'email',
      width: 170,
      ellipsis: true,
      render: (_, record) => getMemberEmail(record),
    },
    {
      title: '所属部门',
      key: 'department',
      width: 150,
      ellipsis: true,
      render: (_, record) => getDepartmentText(record),
    },
    {
      title: '管理范围',
      key: 'scope',
      width: 86,
      render: () => '全部',
    },
    {
      title: '操作',
      key: 'action',
      width: 72,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            message.info(`${getMemberName(record)} 已在当前角色中`);
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  const renderRoleList = () => {
    if (rolesQuery.isLoading) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="角色加载中" />;
    }

    if (!roles.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无角色" />;
    }

    return roles.map((role) => {
      const typeMeta = ROLE_TYPE_META[role.type] || ROLE_TYPE_META.CUSTOM;
      return (
        <div
          key={role.id}
          className={`org-role-item${selectedRole?.id === role.id ? ' is-active' : ''}`}
        >
          <button
            type="button"
            className="org-role-item-main"
            onClick={() => {
              setSelectedRoleId(role.id);
              setSelectedRowKeys([]);
            }}
          >
            <UserSwitchOutlined />
            <span className="org-role-item-name">{role.name}</span>
            {role.type === 'SYSTEM' && <Tag color={typeMeta.color}>{typeMeta.label}</Tag>}
          </button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: getRoleMenuItems(role),
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                handleRoleMenuClick(key, role);
              },
            }}
          >
            <Button
              type="text"
              size="small"
              className="org-role-item-menu"
              icon={<EllipsisOutlined />}
              onClick={(event) => event.stopPropagation()}
            />
          </Dropdown>
        </div>
      );
    });
  };

  return (
    <div className="org-role-page">
      {!currentOrgId && (
        <Alert
          type="warning"
          showIcon
          message="当前账号未关联组织"
          description="请联系管理员将账号加入组织后再管理组织角色。"
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="org-role-breadcrumb">组织架构 〉角色管理</div>

      <div className="org-role-shell">
        <aside className="org-role-list-pane">
          <Input
            allowClear
            className="org-role-search"
            prefix={<SearchOutlined />}
            placeholder="搜索角色"
            value={roleKeyword}
            onChange={(event) => setRoleKeyword(event.target.value)}
          />

          <div className="org-role-list">{renderRoleList()}</div>

          <Perm permission={PERMISSIONS.ROLE.CREATE}>
            <Button
              block
              className="org-role-new-button"
              onClick={handleOpenCreateRole}
              disabled={!currentOrgId}
            >
              新增角色
            </Button>
          </Perm>
        </aside>

        <main className="org-role-content">
          {selectedRole ? (
            <>
              <div className="org-role-header">
                <div className="org-role-title">
                  <Title level={4}>{selectedRole.name}</Title>
                  <Text type="secondary" ellipsis className="org-role-code">
                    {selectedRole.code}
                  </Text>
                </div>
                <span className="org-role-count">
                  <UserOutlined />
                  {roleMembers.length}
                </span>
              </div>

              <div className="org-role-toolbar">
                <Input
                  allowClear
                  className="org-role-member-search"
                  prefix={<SearchOutlined />}
                  placeholder="搜索成员姓名"
                  value={memberKeyword}
                  onChange={(event) => setMemberKeyword(event.target.value)}
                />
                <Space size="small" wrap>
                  <Perm permission={PERMISSIONS.ROLE.UPDATE}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        addMemberForm.resetFields();
                        setAddMemberOpen(true);
                      }}
                      disabled={!currentOrgId || !selectedRole.active}
                    >
                      添加成员
                    </Button>
                  </Perm>
                  <Dropdown
                    menu={{
                      items: importExportItems,
                      onClick: ({ key }) => {
                        if (key === 'export') exportMembers();
                      },
                    }}
                  >
                    <Button>批量导入/导出</Button>
                  </Dropdown>
                  <Tooltip title="当前接口未返回角色绑定 ID，暂不能从角色中移除成员">
                    <span>
                      <Button disabled>移除成员</Button>
                    </span>
                  </Tooltip>
                </Space>
              </div>

              <Table
                columns={memberColumns}
                dataSource={roleMembers}
                rowKey="id"
                loading={membersQuery.isLoading || membersQuery.isFetching}
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无角色成员" />
                  ),
                }}
              />
            </>
          ) : (
            <div className="org-role-empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择角色" />
            </div>
          )}
        </main>
      </div>

      <Modal
        title={roleModalMode === 'edit' ? '编辑角色' : '新增角色'}
        open={roleModalOpen}
        onOk={() => roleForm.validateFields().then((values) => saveRoleMutation.mutate(values))}
        onCancel={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
          roleForm.resetFields();
        }}
        confirmLoading={saveRoleMutation.isPending}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnHidden
      >
        <Form form={roleForm} layout="vertical">
          <div className="org-role-form-section">角色信息</div>
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            label="角色编码"
            name="code"
            rules={[{ required: roleModalMode === 'create', message: '请输入角色编码' }]}
          >
            <Input disabled={roleModalMode === 'edit'} placeholder="请输入角色编码" />
          </Form.Item>
          <Form.Item label="角色描述" name="description">
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item label="角色级别" name="level">
            <InputNumber min={1} max={999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="启用状态" name="active" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`添加成员到 ${selectedRole?.name || '角色'}`}
        open={addMemberOpen}
        onOk={() =>
          addMemberForm.validateFields().then((values) => addMemberMutation.mutate(values))
        }
        onCancel={() => {
          setAddMemberOpen(false);
          addMemberForm.resetFields();
        }}
        confirmLoading={addMemberMutation.isPending}
        okText="添加"
        cancelText="取消"
        width={640}
        destroyOnHidden
      >
        <Form form={addMemberForm} layout="vertical">
          <Form.Item
            label="成员"
            name="membershipIds"
            rules={[{ required: true, message: '请选择成员' }]}
          >
            <Select
              mode="multiple"
              showSearch={{ optionFilterProp: 'label' }}
              placeholder="搜索并选择成员"
              options={eligibleMembers.map((member) => {
                const name = getMemberName(member);
                const email = getMemberEmail(member);
                return {
                  label: `${name}${email === '-' ? '' : ` (${email})`}`,
                  value: member.id,
                };
              })}
              notFoundContent="暂无可添加成员"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
