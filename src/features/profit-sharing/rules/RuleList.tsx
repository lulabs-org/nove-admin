import React, { useState } from 'react';
import { Table, Card, Button, Tag, Space, Drawer, message, Popconfirm } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ruleApi } from './api/ruleApi';
import dayjs from 'dayjs';
import { RuleForm } from './RuleForm';
import type { ProfitSharingModule, ProfitSharingRule } from './types';

export const RuleList: React.FC = () => {
  const {
    data: rules,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['profit-sharing-rules'],
    queryFn: () => ruleApi.list(),
  });

  const queryClient = useQueryClient();

  const calculateMutation = useMutation({
    mutationFn: ruleApi.calculate,
    onSuccess: (data: { success: boolean; processedOrders: number; totalFound: number }) => {
      message.success(
        `批量计算完成！共找到 ${data.totalFound} 笔匹配订单，其中 ${data.processedOrders} 笔已生成分润流水。`
      );
      queryClient.invalidateQueries({ queryKey: ['profit-sharing-records'] });
      queryClient.invalidateQueries({ queryKey: ['profit-dashboard-stats'] });
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      message.error(err?.response?.data?.message || '批量计算失败');
    },
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingRuleId(id);
    setDrawerVisible(true);
  };

  const handleCreate = () => {
    setEditingRuleId(null);
    setDrawerVisible(true);
  };

  const columns: ColumnsType<ProfitSharingRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '生效时间周期',
      key: 'validTime',
      render: (_: string, record: ProfitSharingRule) => {
        const start = dayjs(record.validStartTime);
        const end = dayjs(record.validEndTime);

        if (end.year() >= 2090) {
          return (
            <Space size="small">
              <Tag color="purple">长期有效</Tag>
              <span className="text-gray-500 text-xs">自 {start.format('YYYY-MM-DD')} 起</span>
            </Space>
          );
        }

        if (start.format('YYYY-MM') === end.format('YYYY-MM')) {
          return (
            <Space size="small">
              <Tag color="cyan">{start.format('YYYY年MM月')}</Tag>
              <span className="text-gray-500 text-xs">
                ({start.format('MM-DD')} ~ {end.format('MM-DD')})
              </span>
            </Space>
          );
        }

        return (
          <span className="text-gray-600">
            {start.format('YYYY-MM-DD')} ~ {end.format('YYYY-MM-DD')}
          </span>
        );
      },
    },
    {
      title: '配置模块',
      key: 'modules',
      render: (_: string, record: ProfitSharingRule) => (
        <Space wrap>
          {record.modules?.map((m: ProfitSharingModule) => (
            <Tag key={m.id} color="blue">
              {m.name} ({Number(m.shareRatio) * 100}%)
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProfitSharingRule['status']) => {
        const color = status === 'ACTIVE' ? 'success' : status === 'DRAFT' ? 'default' : 'error';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: ProfitSharingRule) => (
        <Space size="middle">
          <a className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(record.id)}>
            编辑
          </a>
          <Popconfirm
            title="确认执行批量补算？"
            description="将自动查找匹配该规则且尚未分润的历史订单，并生成分润流水。"
            onConfirm={() => calculateMutation.mutate(record.id)}
            okText="确认计算"
            cancelText="取消"
          >
            <a className="text-orange-500 hover:text-orange-600">计算</a>
          </Popconfirm>
          <a className="text-red-500 hover:text-red-600">停用</a>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="分润规则管理"
        bordered={false}
        className="shadow-sm"
        extra={
          <Button type="primary" onClick={handleCreate}>
            新建规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title={editingRuleId ? '编辑分润规则' : '新建分润规则'}
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
      >
        <RuleForm
          ruleId={editingRuleId}
          onSuccess={() => {
            setDrawerVisible(false);
            refetch();
          }}
          onCancel={() => setDrawerVisible(false)}
        />
      </Drawer>
    </div>
  );
};
