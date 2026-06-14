import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import Popconfirm from 'antd/es/popconfirm';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  useTableDeleteMutation,
  useTableMutation,
  useTableQuery,
  type TableQueryParams,
} from '../../../shared/hooks/useTableQuery';
import { taskApi } from '../api/taskApi';
import type { CreateCronTask, CreateOnceTask, ScheduledTask, TaskStatus, TaskType } from '../types';

const { Search, TextArea } = Input;
const { Option } = Select;

type TaskFormMode = 'create' | 'edit';

interface TaskFormValues {
  type: TaskType;
  name: string;
  runAt?: dayjs.Dayjs;
  cron?: string;
  timezone?: string;
  status?: TaskStatus;
  jobIdHint?: string;
  payloadText: string;
}

const TASK_TYPE_OPTIONS: Array<{ label: string; value: TaskType }> = [
  { label: '一次性', value: 'ONCE' },
  { label: 'CRON', value: 'CRON' },
];

const TASK_STATUS_OPTIONS: Array<{ label: string; value: TaskStatus }> = [
  { label: '待处理', value: 'PENDING' },
  { label: '已计划', value: 'SCHEDULED' },
  { label: '运行中', value: 'RUNNING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '失败', value: 'FAILED' },
  { label: '已暂停', value: 'PAUSED' },
];

const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: 'default' },
  SCHEDULED: { label: '已计划', color: 'processing' },
  RUNNING: { label: '运行中', color: 'blue' },
  COMPLETED: { label: '已完成', color: 'success' },
  FAILED: { label: '失败', color: 'error' },
  PAUSED: { label: '已暂停', color: 'warning' },
};

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function formatPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload ?? {}, null, 2);
}

function parsePayload(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text || '{}');

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('payload 必须是 JSON 对象');
  }

  return parsed as Record<string, unknown>;
}

function getOrderDir(order: 'ascend' | 'descend' | null | undefined) {
  if (order === 'ascend') return 'asc';
  if (order === 'descend') return 'desc';
  return undefined;
}

function getTaskTypeLabel(type: TaskType) {
  return TASK_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function TaskManagement() {
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: undefined,
    type: undefined,
    orderBy: 'createdAt',
    orderDir: 'desc',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<TaskFormMode>('create');
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [form] = Form.useForm<TaskFormValues>();
  const watchedType = Form.useWatch('type', form);

  const {
    data: taskList,
    isLoading,
    isFetching,
    refetch,
  } = useTableQuery<ScheduledTask>({
    queryKey: 'tasks',
    queryFn: (params) => taskApi.list(params),
    params: filters,
  });

  const createOnceMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.createOnce,
    onSuccess: () => {
      message.success('创建一次性任务成功');
      closeModal();
    },
    onError: () => {
      message.error('创建一次性任务失败');
    },
  });

  const createCronMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.createCron,
    onSuccess: () => {
      message.success('创建 CRON 任务成功');
      closeModal();
    },
    onError: () => {
      message.error('创建 CRON 任务失败');
    },
  });

  const updateMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof taskApi.update>[1] }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      message.success('更新任务成功');
      closeModal();
    },
    onError: () => {
      message.error('更新任务失败');
    },
  });

  const deleteMutation = useTableDeleteMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.delete,
    onSuccess: () => {
      message.success('删除任务成功');
    },
    onError: () => {
      message.error('删除任务失败');
    },
  });

  const runNowMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.runNow,
    onSuccess: (result) => {
      message.success(`任务已提交执行${result.jobId ? `，Job ID：${result.jobId}` : ''}`);
    },
    onError: () => {
      message.error('立即执行任务失败');
    },
  });

  const pauseMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.pauseQueue,
    onSuccess: () => {
      message.success('任务队列已暂停');
    },
    onError: () => {
      message.error('暂停任务队列失败');
    },
  });

  const resumeMutation = useTableMutation({
    queryKey: 'tasks',
    mutationFn: taskApi.resumeQueue,
    onSuccess: () => {
      message.success('任务队列已恢复');
    },
    onError: () => {
      message.error('恢复任务队列失败');
    },
  });

  const submitting =
    createOnceMutation.isPending || createCronMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!modalOpen) return;

    if (formMode === 'create') {
      form.setFieldsValue({
        type: 'ONCE',
        name: '',
        runAt: dayjs().add(1, 'hour'),
        cron: '0 9 * * *',
        timezone: 'Asia/Shanghai',
        status: undefined,
        jobIdHint: '',
        payloadText: '{}',
      });
      return;
    }

    if (!editingTask) return;

    form.setFieldsValue({
      type: editingTask.type,
      name: editingTask.name,
      runAt: editingTask.runAt ? dayjs(editingTask.runAt) : undefined,
      cron: editingTask.cron ?? undefined,
      timezone: editingTask.timezone ?? 'Asia/Shanghai',
      status: editingTask.status,
      jobIdHint: editingTask.jobId ?? '',
      payloadText: formatPayload(editingTask.payload),
    });
  }, [editingTask, form, formMode, modalOpen]);

  const tableData = useMemo(() => taskList?.data ?? [], [taskList?.data]);

  const handleSearch = (field: string, value?: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
      page: 1,
    }));
  };

  const handleCreate = () => {
    setFormMode('create');
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ScheduledTask) => {
    setFormMode('edit');
    setEditingTask(record);
    setModalOpen(true);
  };

  const handleDelete = (record: ScheduledTask) => {
    deleteMutation.mutate(record.id);
  };

  const handleRunNow = (record: ScheduledTask) => {
    runNowMutation.mutate(record.id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  const handleTableChange: TableProps<ScheduledTask>['onChange'] = (
    pagination,
    _filters,
    sorter
  ) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = activeSorter?.field;
    const orderBy = field === 'updatedAt' || field === 'createdAt' ? field : undefined;

    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      orderBy,
      orderDir: getOrderDir(activeSorter?.order),
    }));
  };

  const submitTaskForm = async () => {
    const values = await form.validateFields();
    let payload: Record<string, unknown>;

    try {
      payload = parsePayload(values.payloadText);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'payload JSON 解析失败';
      form.setFields([{ name: 'payloadText', errors: [description] }]);
      return;
    }

    if (formMode === 'edit' && editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: {
          name: values.name,
          cron: values.type === 'CRON' ? values.cron : undefined,
          timezone: values.type === 'CRON' ? values.timezone : undefined,
          status: values.status,
          payload,
        },
      });
      return;
    }

    if (values.type === 'CRON') {
      const data: CreateCronTask = {
        name: values.name,
        cron: values.cron ?? '',
        timezone: values.timezone || 'Asia/Shanghai',
        payload,
      };
      createCronMutation.mutate(data);
      return;
    }

    const data: CreateOnceTask = {
      name: values.name,
      runAt: values.runAt?.toISOString() ?? '',
      payload,
      jobIdHint: values.jobIdHint || undefined,
    };
    createOnceMutation.mutate(data);
  };

  const columns: TableProps<ScheduledTask>['columns'] = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 96,
      render: (type: TaskType) => (
        <Tag color={type === 'CRON' ? 'purple' : 'cyan'}>{getTaskTypeLabel(type)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 108,
      render: (status: TaskStatus) => {
        const meta = TASK_STATUS_META[status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '计划',
      key: 'schedule',
      render: (_: unknown, record) => {
        if (record.type === 'CRON') {
          return (
            <Space orientation="vertical" size={0}>
              <span>{record.cron || '-'}</span>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                {record.timezone || 'Asia/Shanghai'}
              </span>
            </Space>
          );
        }

        return formatDateTime(record.runAt);
      },
    },
    {
      title: '队列',
      dataIndex: 'queueName',
      key: 'queueName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '最近错误',
      dataIndex: 'lastError',
      key: 'lastError',
      ellipsis: true,
      render: (lastError: string | null) =>
        lastError ? (
          <Tooltip title={lastError}>
            <span style={{ color: '#cf1322' }}>{lastError}</span>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 172,
      render: (_: unknown, record) => (
        <Space size="small">
          <Tooltip title="立即执行">
            <Button
              type="link"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => handleRunNow(record)}
              loading={runNowMutation.isPending}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此任务吗？"
            description="删除后会同步移除对应队列任务"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建任务
        </Button>

        <Search
          placeholder="搜索任务名称"
          allowClear
          style={{ width: 220 }}
          onSearch={(value) => handleSearch('search', value)}
          onChange={(event) => !event.target.value && handleSearch('search', '')}
        />

        <Select
          placeholder="任务类型"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => handleSearch('type', value)}
          options={TASK_TYPE_OPTIONS}
        />

        <Select
          placeholder="任务状态"
          allowClear
          style={{ width: 128 }}
          onChange={(value) => handleSearch('status', value)}
          options={TASK_STATUS_OPTIONS}
        />

        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
          刷新
        </Button>

        <Popconfirm
          title="确定要暂停整个任务队列吗？"
          onConfirm={() => pauseMutation.mutate(undefined)}
          okText="确定"
          cancelText="取消"
        >
          <Button icon={<PauseCircleOutlined />} loading={pauseMutation.isPending}>
            暂停队列
          </Button>
        </Popconfirm>

        <Button
          icon={<PlayCircleOutlined />}
          onClick={() => resumeMutation.mutate(undefined)}
          loading={resumeMutation.isPending}
        >
          恢复队列
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1180 }}
        pagination={{
          current: filters.page as number,
          pageSize: filters.pageSize as number,
          total: taskList?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={formMode === 'create' ? '新建任务' : '编辑任务'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={submitTaskForm}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnHidden
        width={720}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select disabled={formMode === 'edit'} options={TASK_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="任务名称" />
          </Form.Item>

          {watchedType === 'CRON' ? (
            <>
              <Form.Item
                name="cron"
                label="CRON 表达式"
                rules={[{ required: true, message: '请输入 CRON 表达式' }]}
              >
                <Input placeholder="0 9 * * *" />
              </Form.Item>

              <Form.Item name="timezone" label="时区">
                <Input placeholder="Asia/Shanghai" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="runAt"
                label="执行时间"
                rules={[{ required: formMode === 'create', message: '请选择执行时间' }]}
              >
                <DatePicker
                  showTime
                  disabled={formMode === 'edit'}
                  style={{ width: '100%' }}
                  placeholder="选择执行时间"
                />
              </Form.Item>

              {formMode === 'create' ? (
                <Form.Item name="jobIdHint" label="Job ID">
                  <Input placeholder="可选" />
                </Form.Item>
              ) : null}
            </>
          )}

          {formMode === 'edit' ? (
            <Form.Item name="status" label="任务状态">
              <Select>
                {TASK_STATUS_OPTIONS.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}

          <Form.Item
            name="payloadText"
            label="Payload"
            rules={[{ required: true, message: '请输入 Payload' }]}
          >
            <TextArea rows={8} spellCheck={false} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
