import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Typography, Tag, Spin } from 'antd';
import { DollarOutlined, FallOutlined, ProfileOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from '../records/api/recordApi';
import type { ProfitSharingDashboardStats } from '../records/types';

const { Title, Text } = Typography;

export const ProfitDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['profit-dashboard-stats'],
    queryFn: () => recordApi.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const stats: ProfitSharingDashboardStats = data || {
    totalOrders: 0,
    totalSettled: 0,
    totalPending: 0,
    totalClawback: 0,
    moduleStats: [],
    memberRankings: [],
  };

  return (
    <div className="p-6">
      <Title level={4} className="mb-6">
        分润数据看板 (实时数据)
      </Title>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="本月累计处理订单"
              value={stats.totalOrders}
              prefix={<ProfileOutlined />}
              suffix="笔"
            />
            <div className="mt-2 text-gray-400 text-xs">（含分润流水的订单）</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm bg-blue-50">
            <Statistic
              title="累计分润金额 (已发)"
              value={stats.totalSettled}
              precision={2}
              prefix={<DollarOutlined />}
            />
            <div className="mt-2 text-gray-400 text-xs">（所有 SETTLED 状态累加）</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm bg-orange-50">
            <Statistic
              title="待结算金额 (未发)"
              value={stats.totalPending}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
            />
            <div className="mt-2 text-gray-500 text-xs">（等待定时任务自动结算）</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm bg-red-50">
            <Statistic
              title="累计退款回扣金额"
              value={stats.totalClawback}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
            <div className="mt-2 text-gray-500 text-xs">（退款导致的追回金额）</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 模块分润占比模拟 */}
        <Col span={14}>
          <Card title="各分润模块金额占比" bordered={false} className="shadow-sm h-full">
            <div className="flex flex-col gap-4">
              {stats.moduleStats.length === 0 && (
                <div className="text-gray-400 text-center py-8">暂无数据</div>
              )}
              {stats.moduleStats.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <Text strong>
                      {item.name} ({item.percent}%)
                    </Text>
                    <Text>
                      ¥{' '}
                      {Number(item.amount).toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <Progress
                    percent={item.percent}
                    strokeColor={
                      index === 0
                        ? '#1890ff'
                        : index === 1
                          ? '#52c41a'
                          : index === 2
                            ? '#faad14'
                            : '#f5222d'
                    }
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 个人收益排行榜 */}
        <Col span={10}>
          <Card title="成员收益排行榜 TOP 5" bordered={false} className="shadow-sm h-full">
            <List
              itemLayout="horizontal"
              dataSource={stats.memberRankings}
              locale={{ emptyText: '暂无数据' }}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-300'}`}
                      >
                        {index + 1}
                      </div>
                    }
                    title={item.name}
                    description={<Tag>{item.role}</Tag>}
                  />
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-800">
                      ¥{' '}
                      {Number(item.amount).toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
