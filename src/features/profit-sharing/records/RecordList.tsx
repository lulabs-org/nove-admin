import React from 'react';
import { Table, Card, Tag, DatePicker, Select, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from './api/recordApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const RecordList: React.FC = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ['profit-sharing-records'],
    queryFn: () => recordApi.list(),
  });

  const columns = [
    {
      title: '流水号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="text-gray-500">{text.slice(0, 8)}...</span>,
    },
    {
      title: '订单号',
      dataIndex: ['order', 'orderNumber'],
      key: 'orderNumber',
    },
    {
      title: '分润模块',
      dataIndex: ['module', 'name'],
      key: 'moduleName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '收益人',
      dataIndex: 'memberId',
      key: 'memberId',
    },
    {
      title: '订单基数 (元)',
      dataIndex: 'baseAmount',
      key: 'baseAmount',
      render: (amount: number) => (amount / 100).toFixed(2),
    },
    {
      title: '分润金额 (元)',
      dataIndex: 'profitAmount',
      key: 'profitAmount',
      render: (amount: number) => {
        const value = (amount / 100).toFixed(2);
        return (
          <span className={amount < 0 ? 'text-red-500' : 'text-green-600 font-medium'}>
            {value}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          PENDING: { color: 'warning', text: '待结算' },
          SETTLED: { color: 'success', text: '已结算' },
          CLAWBACK: { color: 'error', text: '已回扣' },
          CANCELLED: { color: 'default', text: '已取消' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '预计结算时间',
      dataIndex: 'settlementTime',
      key: 'settlementTime',
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '流水生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div className="p-6">
      <Card title="分润流水" bordered={false} className="shadow-sm">
        <div className="mb-4">
          <Space>
            <RangePicker />
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Select.Option value="PENDING">待结算</Select.Option>
              <Select.Option value="SETTLED">已结算</Select.Option>
              <Select.Option value="CLAWBACK">已回扣</Select.Option>
            </Select>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={records || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
