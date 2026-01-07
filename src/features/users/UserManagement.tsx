import { Button, Space, Table, message, Popconfirm } from 'antd';
import { Perm } from '../../app/guards/Perm';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '正常' },
    { id: '2', name: '李四', email: 'lisi@example.com', role: '用户', status: '正常' },
    { id: '3', name: '王五', email: 'wangwu@example.com', role: '用户', status: '禁用' },
  ]);

  const handleCreate = () => {
    message.info('点击了新增用户按钮');
  };

  const handleEdit = (record: User) => {
    message.info(`编辑用户: ${record.name}`);
  };

  const handleDelete = (record: User) => {
    setUsers(users.filter((u) => u.id !== record.id));
    message.success(`删除用户: ${record.name}`);
  };

  const handleAudit = (record: User) => {
    message.info(`审核用户: ${record.name}`);
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Perm permission={PERMISSIONS.USER.EDIT}>
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
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Perm>

          <Perm permission={PERMISSIONS.USER.AUDIT}>
            <Button type="link" size="small" onClick={() => handleAudit(record)}>
              审核
            </Button>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Perm permission={PERMISSIONS.USER.CREATE}>
          <Button type="primary" onClick={handleCreate}>
            新增用户
          </Button>
        </Perm>
      </div>

      <Table columns={columns} dataSource={users} rowKey="id" />
    </div>
  );
}
