import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Typography,
  Tag,
  Spin,
  Button,
  DatePicker,
  Space,
  Radio,
} from 'antd';
import {
  DollarOutlined,
  FallOutlined,
  ProfileOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { recordApi } from '../records/api/recordApi';
import type { ProfitSharingDashboardStats } from '../records/types';

const { Title, Text } = Typography;

export const ProfitDashboard: React.FC = () => {
  const currentMonthStr = dayjs().format('YYYY-MM');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['profit-dashboard-stats', selectedMonth],
    queryFn: () => recordApi.getDashboardStats(selectedMonth),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const stats: ProfitSharingDashboardStats = data || {
    month: selectedMonth,
    totalOrders: 0,
    totalSettled: 0,
    totalPending: 0,
    totalClawback: 0,
    moduleStats: [],
    memberRankings: [],
  };

  const periodDisplay = selectedMonth === 'ALL' ? '全部历史累计' : `${selectedMonth} 账期`;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <Title level={4} className="!mb-0">
              分润数据看板
            </Title>
            <Tag
              color={selectedMonth === 'ALL' ? 'blue' : 'cyan'}
              className="text-sm px-2.5 py-0.5"
            >
              {periodDisplay}
            </Tag>
          </div>
          <Text type="secondary" className="text-xs mt-1 block">
            实时统计分润订单、发放状态、模块占比与成员收益排名
          </Text>
        </div>

        <Space wrap align="center">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-gray-400" />
            <span className="text-sm text-gray-600">统计月份：</span>
            <DatePicker
              picker="month"
              value={selectedMonth !== 'ALL' ? dayjs(selectedMonth, 'YYYY-MM') : null}
              placeholder="选择其他月份"
              allowClear={false}
              onChange={(date) => {
                if (date) {
                  setSelectedMonth(date.format('YYYY-MM'));
                }
              }}
              style={{ width: 140 }}
            />
          </div>

          <Radio.Group
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value={currentMonthStr}>本月</Radio.Button>
            <Radio.Button value={dayjs().subtract(1, 'month').format('YYYY-MM')}>上月</Radio.Button>
            <Radio.Button value="ALL">全部累计</Radio.Button>
          </Radio.Group>

          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={selectedMonth === 'ALL' ? '累计处理订单' : `${periodDisplay}处理订单`}
              value={stats.totalOrders}
              prefix={<ProfileOutlined />}
              suffix="笔"
            />
            <div className="mt-2 text-gray-400 text-xs">（已完成分润流水的订单）</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm bg-blue-50">
            <Statistic
              title={selectedMonth === 'ALL' ? '累计分润金额 (已发)' : `${periodDisplay}已发分润`}
              value={stats.totalSettled}
              precision={2}
              prefix={<DollarOutlined />}
            />
            <div className="mt-2 text-gray-400 text-xs">（SETTLED 状态已发放金额）</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm bg-orange-50">
            <Statistic
              title={selectedMonth === 'ALL' ? '待结算金额 (未发)' : `${periodDisplay}待结算金额`}
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
              title={selectedMonth === 'ALL' ? '累计退款回扣金额' : `${periodDisplay}退款回扣`}
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
        {/* 模块分润占比 */}
        <Col span={14}>
          <Card
            title={`各分润模块金额占比 (${periodDisplay})`}
            bordered={false}
            className="shadow-sm h-full"
          >
            <div className="flex flex-col gap-4">
              {stats.moduleStats.length === 0 && (
                <div className="text-gray-400 text-center py-8">该周期内暂无分润模块数据</div>
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
          <Card
            title={`成员收益排行榜 TOP 5 (${periodDisplay})`}
            bordered={false}
            className="shadow-sm h-full"
          >
            <List
              itemLayout="horizontal"
              dataSource={stats.memberRankings}
              locale={{ emptyText: '该周期内暂无收益排行数据' }}
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
