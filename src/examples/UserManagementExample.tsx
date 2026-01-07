import { Button, Space, Table } from 'antd';
import { Perm } from '../shared/components/Perm';
import { PERMISSIONS } from '../shared/utils/permissions';

export function UserManagementExample() {
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
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Perm permission={PERMISSIONS.USER.EDIT}>
            <Button type="link" size="small">
              编辑
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.USER.DELETE}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.USER.AUDIT}>
            <Button type="link" size="small">
              审核
            </Button>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Perm permission={PERMISSIONS.USER.CREATE}>
          <Button type="primary">新增用户</Button>
        </Perm>
      </div>

      <Table columns={columns} dataSource={[]} />
    </div>
  );
}
