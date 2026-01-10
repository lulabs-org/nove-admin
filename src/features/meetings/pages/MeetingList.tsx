import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import type { TableProps } from 'antd/es/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTableQuery,
  useTableMutation,
  useTableDeleteMutation,
  type TableQueryParams,
} from '../../../shared/hooks/useTableQuery';
import { meetingApi } from '../api/meetingApi';
import type { Meeting, MeetingListParams } from '../model/types';
import {
  MeetingControllerGetMeetingRecordsPlatform,
  MeetingControllerGetMeetingRecordsStatus,
} from '../../../shared/lib/api/orval/business/schemas';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function MeetingList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: undefined,
    platform: undefined,
  });

  const {
    data: meetingList,
    isLoading,
    refetch,
  } = useTableQuery<Meeting>({
    queryKey: 'meetings',
    queryFn: (params) => {
      const { pageSize, ...restParams } = params;
      return meetingApi.list({
        ...restParams,
        limit: pageSize,
      } as unknown as MeetingListParams);
    },
    params: filters,
  });

  const deleteMutation = useTableDeleteMutation({
    queryKey: 'meetings',
    mutationFn: meetingApi.delete,
    onSuccess: () => {
      message.success('删除会议成功');
    },
    onError: () => {
      message.error('删除会议失败');
    },
  });

  const reprocessMutation = useTableMutation({
    queryKey: 'meetings',
    mutationFn: (id: string) => meetingApi.reprocess(id),
    onSuccess: () => {
      message.success('重新处理会议成功');
    },
    onError: () => {
      message.error('重新处理会议失败');
    },
  });

  const handleCreate = () => {
    message.info('点击了新增会议按钮');
  };

  const handleView = (record: Meeting) => {
    navigate(`/meetings/${record.id}`);
  };

  const handleEdit = (record: Meeting) => {
    message.info(`编辑会议: ${record.title}`);
  };

  const handleDelete = (record: Meeting) => {
    deleteMutation.mutate(record.id);
  };

  const handleReprocess = (record: Meeting) => {
    reprocessMutation.mutate(record.id);
  };

  const handleSearch = (field: string, value: string) => {
    setFilters((prev: TableQueryParams) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleDateRangeChange = (dates: null | [unknown, unknown]) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev: TableQueryParams) => ({
        ...prev,
        startDate: (dates[0] as { format: (format: string) => string }).format('YYYY-MM-DD'),
        endDate: (dates[1] as { format: (format: string) => string }).format('YYYY-MM-DD'),
        page: 1,
      }));
    } else {
      setFilters((prev: TableQueryParams) => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      }));
    }
  };

  const handleTableChange: TableProps<Meeting>['onChange'] = (pagination, _filters, sorter) => {
    setFilters((prev: TableQueryParams) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: Array.isArray(sorter)
        ? String(sorter[0].field)
        : sorter.field
          ? String(sorter.field)
          : undefined,
      sortOrder: (Array.isArray(sorter) ? sorter[0].order : sorter.order) || undefined,
    }));
  };

  const getStatusText = (status: MeetingControllerGetMeetingRecordsStatus) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: '待处理', color: 'blue' },
      PROCESSING: { text: '处理中', color: 'green' },
      COMPLETED: { text: '已完成', color: 'default' },
      FAILED: { text: '失败', color: 'red' },
      SKIPPED: { text: '已跳过', color: 'orange' },
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const getMeetingTypeText = (type?: MeetingControllerGetMeetingRecordsPlatform) => {
    const typeMap: Record<string, string> = {
      TENCENT_MEETING: '腾讯会议',
      ZOOM: 'Zoom',
      TEAMS: 'Teams',
      DINGTALK: '钉钉',
      FEISHU: '飞书',
      WEBEX: 'Webex',
      VOOV: 'Voov',
      OTHER: '其他',
    };
    return typeMap[type || ''] || type || '-';
  };

  const columns = [
    {
      title: '会议标题',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: '会议类型',
      dataIndex: 'meetingType',
      key: 'meetingType',
      filters: [
        { text: '腾讯会议', value: 'TENCENT_MEETING' },
        { text: 'Zoom', value: 'ZOOM' },
        { text: 'Teams', value: 'TEAMS' },
        { text: '钉钉', value: 'DINGTALK' },
        { text: '飞书', value: 'FEISHU' },
        { text: 'Webex', value: 'WEBEX' },
        { text: 'Voov', value: 'VOOV' },
        { text: '其他', value: 'OTHER' },
      ],
      render: (type: MeetingControllerGetMeetingRecordsPlatform) => getMeetingTypeText(type),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: true,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      sorter: true,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '主持人',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: '参与人数',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '待处理', value: 'PENDING' },
        { text: '处理中', value: 'PROCESSING' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '失败', value: 'FAILED' },
        { text: '已跳过', value: 'SKIPPED' },
      ],
      render: (status: MeetingControllerGetMeetingRecordsStatus) => {
        const { text, color } = getStatusText(status);
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Meeting) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 'COMPLETED' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleReprocess(record)}
              loading={reprocessMutation.isPending}
            >
              重新处理
            </Button>
          )}
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger loading={deleteMutation.isPending}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={handleCreate}>
          新增会议
        </Button>

        <Search
          placeholder="搜索会议标题"
          allowClear
          style={{ width: 200 }}
          onSearch={(value) => handleSearch('search', value)}
          onChange={(e) => !e.target.value && handleSearch('search', '')}
        />

        <Select
          placeholder="选择会议类型"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('platform', value)}
        >
          <Option value="TENCENT_MEETING">腾讯会议</Option>
          <Option value="ZOOM">Zoom</Option>
          <Option value="TEAMS">Teams</Option>
          <Option value="DINGTALK">钉钉</Option>
          <Option value="FEISHU">飞书</Option>
          <Option value="WEBEX">Webex</Option>
          <Option value="VOOV">Voov</Option>
          <Option value="OTHER">其他</Option>
        </Select>

        <Select
          placeholder="选择状态"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('status', value)}
        >
          <Option value="PENDING">待处理</Option>
          <Option value="PROCESSING">处理中</Option>
          <Option value="COMPLETED">已完成</Option>
          <Option value="FAILED">失败</Option>
          <Option value="SKIPPED">已跳过</Option>
        </Select>

        <RangePicker placeholder={['开始日期', '结束日期']} onChange={handleDateRangeChange} />

        <Button onClick={() => refetch()}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={meetingList?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: meetingList?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
