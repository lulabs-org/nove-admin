import { useState } from 'react';
import { Card, Table, Tag, Space, Button, Drawer, Form, Input, Select, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { webhookLogApi } from './api/webhookLogApi';
import type {
  WebhookLogDto,
  WebhookLogControllerFindAllStatus,
} from '../../shared/lib/api/orval/business/schemas';

const { Text } = Typography;

export function WebhookLogManagement() {
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [filters, setFilters] = useState<{
    provider?: string;
    event?: string;
    status?: WebhookLogControllerFindAllStatus;
  }>({});

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<WebhookLogDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['webhook-logs', pagination.current, pagination.pageSize, filters],
    queryFn: () =>
      webhookLogApi.list({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      }),
  });

  const handleSearch = (values: {
    provider?: string;
    event?: string;
    status?: WebhookLogControllerFindAllStatus;
  }) => {
    setFilters({
      provider: values.provider || undefined,
      event: values.event || undefined,
      status: values.status || undefined,
    });
    setPagination({ ...pagination, current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({});
    setPagination({ ...pagination, current: 1 });
  };

  const showDetail = (log: WebhookLogDto) => {
    setCurrentLog(log);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'SUCCESS') color = 'success';
        if (status === 'FAILED') color = 'error';
        if (status === 'PENDING') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Error Message',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      render: (msg?: string) =>
        msg ? (
          <Text type="danger" ellipsis={{ tooltip: msg }}>
            {msg}
          </Text>
        ) : (
          '-'
        ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: WebhookLogDto) => (
        <Button type="link" onClick={() => showDetail(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="provider" label="Provider">
            <Input placeholder="e.g. LARK" allowClear />
          </Form.Item>
          <Form.Item name="event" label="Event">
            <Input placeholder="Event type" allowClear />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select placeholder="All" allowClear style={{ width: 120 }}>
              <Select.Option value="SUCCESS">Success</Select.Option>
              <Select.Option value="FAILED">Failed</Select.Option>
              <Select.Option value="PENDING">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                Search
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
          }}
          onChange={(pag) => {
            setPagination({ current: pag.current || 1, pageSize: pag.pageSize || 20 });
          }}
        />
      </Card>

      <Drawer
        title="Webhook Log Details"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentLog && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>ID: </Text>
              <Text copyable>{currentLog.id}</Text>
            </div>
            <div>
              <Text strong>External ID: </Text>
              <Text>{currentLog.externalId || '-'}</Text>
            </div>
            {currentLog.errorMessage && (
              <div>
                <Text strong>Error Message: </Text>
                <Text type="danger">{currentLog.errorMessage}</Text>
              </div>
            )}
            <div>
              <Text strong>Payload:</Text>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 12,
                  borderRadius: 6,
                  overflowX: 'auto',
                  maxHeight: 400,
                }}
              >
                {JSON.stringify(currentLog.payload, null, 2)}
              </pre>
            </div>
            {currentLog.data && (
              <div>
                <Text strong>Parsed Data:</Text>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 6,
                    overflowX: 'auto',
                    maxHeight: 400,
                  }}
                >
                  {JSON.stringify(currentLog.data, null, 2)}
                </pre>
              </div>
            )}
            {currentLog.headers && (
              <div>
                <Text strong>Headers:</Text>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 6,
                    overflowX: 'auto',
                    maxHeight: 200,
                  }}
                >
                  {JSON.stringify(currentLog.headers, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        )}
      </Drawer>
    </Space>
  );
}
