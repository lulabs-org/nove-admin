import React, { useState } from 'react';
import { Table, Card, Tag, DatePicker, Select, Space, Button, Popconfirm, message } from 'antd';
import type { TableProps } from 'antd/es/table';
import { recordApi } from './api/recordApi';
import dayjs from 'dayjs';
import {
  useTableQuery,
  useTableMutation,
  type TableQueryParams,
} from '../../../shared/hooks/useTableQuery';
import type { ProfitSharingRecord } from './types';

const { RangePicker } = DatePicker;

export const RecordList: React.FC = () => {
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
  });

  const { data: recordsData, isLoading } = useTableQuery<ProfitSharingRecord>({
    queryKey: 'profit-sharing-records',
    queryFn: recordApi.list,
    params: filters,
  });

  const settleMutation = useTableMutation({
    queryKey: 'profit-sharing-records',
    mutationFn: recordApi.settle,
    onSuccess: () => {
      message.success('结算成功');
    },
    onError: (error: unknown) => {
      const apiErr = error as { response?: { data?: { message?: string } } };
      message.error(apiErr?.response?.data?.message || '结算失败');
    },
  });

  const cancelMutation = useTableMutation({
    queryKey: 'profit-sharing-records',
    mutationFn: recordApi.cancel,
    onSuccess: () => {
      message.success('取消成功');
    },
    onError: (error: unknown) => {
      const apiErr = error as { response?: { data?: { message?: string } } };
      message.error(apiErr?.response?.data?.message || '取消失败');
    },
  });

  const undoSettleMutation = useTableMutation({
    queryKey: 'profit-sharing-records',
    mutationFn: recordApi.undoSettle,
    onSuccess: () => {
      message.success('撤销结算成功');
    },
    onError: (error: unknown) => {
      const apiErr = error as { response?: { data?: { message?: string } } };
      message.error(apiErr?.response?.data?.message || '撤销结算失败');
    },
  });

  const restoreMutation = useTableMutation({
    queryKey: 'profit-sharing-records',
    mutationFn: recordApi.restore,
    onSuccess: () => {
      message.success('恢复成功');
    },
    onError: (error: unknown) => {
      const apiErr = error as { response?: { data?: { message?: string } } };
      message.error(apiErr?.response?.data?.message || '恢复失败');
    },
  });

  const handleTableChange: TableProps<ProfitSharingRecord>['onChange'] = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const handleStatusChange = (status: string | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleDateRangeChange = (dates: unknown, dateStrings: [string, string]) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        startDate: dateStrings[0],
        endDate: dateStrings[1],
        page: 1,
      }));
    } else {
      setFilters((prev) => {
        const next = { ...prev, page: 1 } as Record<string, unknown>;
        delete next['startDate'];
        delete next['endDate'];
        return next as TableQueryParams;
      });
    }
  };

  const columns: TableProps<ProfitSharingRecord>['columns'] = [
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
      key: 'memberId',
      render: (_, record) => (
        <Space size="small">
          <span className="font-medium text-gray-800">{record.memberName || record.memberId}</span>
          {record.memberRole && <Tag color="geekblue">{record.memberRole}</Tag>}
        </Space>
      ),
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
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'CLAWBACK') {
          return '-';
        }

        if (record.status === 'SETTLED') {
          return (
            <Popconfirm
              title="确定要撤销结算吗？这会将流水恢复为待结算状态。"
              onConfirm={() => undoSettleMutation.mutate(record.id)}
            >
              <Button type="link" danger size="small">
                撤销结算
              </Button>
            </Popconfirm>
          );
        }

        if (record.status === 'CANCELLED') {
          return (
            <Popconfirm
              title="确定要恢复该笔流水吗？"
              onConfirm={() => restoreMutation.mutate(record.id)}
            >
              <Button type="link" size="small">
                恢复
              </Button>
            </Popconfirm>
          );
        }

        return (
          <Space>
            <Popconfirm
              title="确定要结算该笔流水吗？"
              onConfirm={() => settleMutation.mutate(record.id)}
            >
              <Button type="link" size="small">
                结算
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确定要取消该笔流水吗？"
              onConfirm={() => cancelMutation.mutate(record.id)}
            >
              <Button type="link" danger size="small">
                取消
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Card title="分润流水" bordered={false} className="shadow-sm">
        <div className="mb-4">
          <Space>
            <RangePicker onChange={handleDateRangeChange} />
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              onChange={handleStatusChange}
            >
              <Select.Option value="PENDING">待结算</Select.Option>
              <Select.Option value="SETTLED">已结算</Select.Option>
              <Select.Option value="CLAWBACK">已回扣</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
            </Select>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={recordsData?.data || []}
          rowKey="id"
          loading={isLoading || settleMutation.isPending || cancelMutation.isPending}
          pagination={{
            current: recordsData?.page || filters.page || 1,
            pageSize: recordsData?.pageSize || filters.pageSize || 10,
            total: recordsData?.total || 0,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};
