import { useState, useCallback } from 'react';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import Switch from 'antd/es/switch';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import type { TableProps } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackingReportApi } from '../api/trackingReportApi';
import {
  TrackingReportType,
  TrackingCadence,
  TRACKING_REPORT_TYPE_LABELS,
  TRACKING_CADENCE_LABELS,
} from '../model/types';
import type {
  TrackingReportListItem,
  TriggerSummaryDto,
  TrackingReportListParams,
} from '../model/types';
import { GenerateReportModal } from '../components/GenerateReportModal';
import { TrackingReportDetail } from '../components/TrackingReportDetail';
import { UserSearchSelect } from '../components/UserSearchSelect';
import { ReportSubjectSummary } from '../components/ReportSubject';
import type { UserFilterValue } from '../components/UserSearchSelect';
import { Perm } from '../../../app/guards/Perm';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import './TrackingReportList.css';

const { RangePicker } = DatePicker;

interface Filters {
  userFilter?: UserFilterValue;
  trackingType?: TrackingReportType;
  cadence?: TrackingCadence;
  periodStart?: string;
  periodEnd?: string;
  isLatest?: boolean;
  page: number;
  limit: number;
}

const initialFilters: Filters = {
  page: 1,
  limit: 20,
};

export function TrackingReportList() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const queryParams: TrackingReportListParams = {
    platformUserId: filters.userFilter?.platformUserId,
    subjectUserId: filters.userFilter?.subjectUserId,
    trackingType: filters.trackingType,
    cadence: filters.cadence,
    periodStart: filters.periodStart,
    periodEnd: filters.periodEnd,
    isLatest: filters.isLatest,
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['tracking-reports', queryParams],
    queryFn: () => trackingReportApi.list(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: trackingReportApi.delete,
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['tracking-reports'], exact: false });
    },
    onError: () => message.error('删除失败'),
  });

  const generateMutation = useMutation({
    mutationFn: (dto: TriggerSummaryDto) => trackingReportApi.generate(dto),
    onSuccess: () => {
      message.success('报告生成任务已触发');
      setGenerateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tracking-reports'], exact: false });
    },
    onError: () => message.error('触发报告生成失败'),
  });

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleUserChange = useCallback((val: UserFilterValue | undefined) => {
    setFilters((prev) => ({ ...prev, userFilter: val, page: 1 }));
  }, []);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates?.[0] && dates?.[1]) {
      setFilters((prev) => ({
        ...prev,
        periodStart: dates[0]!.toISOString(),
        periodEnd: dates[1]!.toISOString(),
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        periodStart: undefined,
        periodEnd: undefined,
        page: 1,
      }));
    }
  };

  const handleTableChange: TableProps<TrackingReportListItem>['onChange'] = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? 20,
    }));
  };

  const columns: TableProps<TrackingReportListItem>['columns'] = [
    {
      title: (
        <Tooltip title="优先显示本地用户；未关联时显示平台用户；项目报告显示项目">
          <span>报告对象</span>
        </Tooltip>
      ),
      key: 'subject',
      width: 160,
      render: (_: unknown, record: TrackingReportListItem) => (
        <ReportSubjectSummary subject={record.subject} identityReportId={record.id} />
      ),
    },
    {
      title: '报告类型',
      dataIndex: 'trackingType',
      key: 'trackingType',
      width: 130,
      render: (v: TrackingReportType) => TRACKING_REPORT_TYPE_LABELS[v] ?? v,
    },
    {
      title: '报告周期',
      key: 'period',
      width: 210,
      render: (_: unknown, record: TrackingReportListItem) => (
        <div className="tracking-report-period">
          <span>
            {new Date(record.periodStart).toLocaleDateString('zh-CN')} –{' '}
            {new Date(record.periodEnd).toLocaleDateString('zh-CN')}
          </span>
          <span className="tracking-report-period__cadence">
            {TRACKING_CADENCE_LABELS[record.cadence] ?? record.cadence}
          </span>
        </div>
      ),
    },
    {
      title: '版本状态',
      key: 'versionStatus',
      width: 110,
      render: (_: unknown, record: TrackingReportListItem) => (
        <div className="tracking-report-version">
          <Tag color={record.isLatest ? 'success' : 'default'}>
            {record.isLatest ? '最新' : '历史'}
          </Tag>
          <span>v{record.version}</span>
        </div>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_: unknown, record: TrackingReportListItem) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
            查看
          </Button>
          <Perm permission={PERMISSIONS.TRACKING_REPORT.DELETE}>
            <Popconfirm
              title="确定要删除此报告吗？"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger loading={deleteMutation.isPending}>
                删除
              </Button>
            </Popconfirm>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Toolbar */}
      <div className="tracking-report-list-toolbar">
        <UserSearchSelect value={filters.userFilter} onChange={handleUserChange} />

        <Select
          placeholder="报告类型"
          allowClear
          style={{ width: 140 }}
          onChange={(value) => setFilter('trackingType', value)}
        >
          {Object.values(TrackingReportType).map((t) => (
            <Select.Option key={t} value={t}>
              {TRACKING_REPORT_TYPE_LABELS[t]}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="周期单位"
          allowClear
          style={{ width: 110 }}
          onChange={(value) => setFilter('cadence', value)}
        >
          {Object.values(TrackingCadence).map((c) => (
            <Select.Option key={c} value={c}>
              {TRACKING_CADENCE_LABELS[c]}
            </Select.Option>
          ))}
        </Select>

        <RangePicker
          placeholder={['周期开始', '周期结束']}
          onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
        />

        <Space size={4}>
          <span style={{ fontSize: 13, color: '#666' }}>仅最新版本</span>
          <Switch
            checked={filters.isLatest ?? false}
            onChange={(checked) => setFilter('isLatest', checked || undefined)}
          />
        </Space>

        <Perm permission={PERMISSIONS.TRACKING_REPORT.CREATE}>
          <Button type="primary" onClick={() => setGenerateOpen(true)}>
            生成报告
          </Button>
        </Perm>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
        <Table
          columns={columns}
          dataSource={data?.data ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: data?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 970 }}
          onChange={handleTableChange}
        />
      </div>

      {/* Generate report modal */}
      <GenerateReportModal
        open={generateOpen}
        submitting={generateMutation.isPending}
        onCancel={() => setGenerateOpen(false)}
        onSubmit={(dto) => generateMutation.mutate(dto)}
      />

      {/* Detail drawer */}
      <TrackingReportDetail id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
