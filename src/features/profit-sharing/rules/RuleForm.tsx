import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Space,
  Card,
  Switch,
  InputNumber,
  Segmented,
  Row,
  Col,
  message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { ruleApi } from './api/ruleApi';
import { OrderUserSelect } from '../../transactions/orders/components/OrderUserSelect';
import { OrderProductSelect } from '../../transactions/orders/components/OrderProductSelect';
import { OrderChannelSelect } from '../../transactions/orders/components/OrderChannelSelect';
import type { ProfitSharingModule } from './types';
import type { RuleWritePayload } from './types';

const { RangePicker } = DatePicker;

export type PeriodMode = 'MONTH' | 'CUSTOM' | 'PERMANENT';

interface RuleFormProps {
  ruleId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RuleFormAllocation {
  id?: string;
  memberId: string;
  allocationRatio: number;
}

interface RuleFormModule {
  id?: string;
  name: string;
  shareRatio: number;
  isRefundable: boolean;
  amortizationType: 'NONE' | 'MONTHLY' | 'END_OF_TERM';
  allocations?: RuleFormAllocation[];
}

interface RuleFormValues {
  name: string;
  productId?: string;
  channelId?: string;
  periodMode: PeriodMode;
  monthPicker?: Dayjs;
  customRange?: [Dayjs, Dayjs];
  permanentStart?: Dayjs;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  modules?: RuleFormModule[];
}

export const RuleForm: React.FC<RuleFormProps> = ({ ruleId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [periodMode, setPeriodMode] = useState<PeriodMode>('MONTH');

  const handleAllocationChange = (
    moduleIndex: number,
    allocIndex: number,
    newValue: number | null
  ) => {
    if (newValue === null) return;
    const modules = (form.getFieldValue('modules') || []) as RuleFormModule[];
    const module = modules[moduleIndex];
    if (!module || !module.allocations) return;

    const allocs = [...module.allocations];
    const n = allocs.length;

    if (n === 1) {
      if (newValue !== 100) {
        allocs[0].allocationRatio = 100;
        form.setFieldsValue({ modules });
      }
      return;
    }

    allocs[allocIndex].allocationRatio = newValue;

    const others = allocs.filter((_, idx) => idx !== allocIndex);
    const remainingTarget = Math.max(0, 100 - newValue);
    const othersSum = others.reduce((sum, a) => sum + (a.allocationRatio || 0), 0);

    allocs.forEach((a, idx) => {
      if (idx === allocIndex) return;
      if (othersSum === 0) {
        a.allocationRatio = Number((remainingTarget / (n - 1)).toFixed(2));
      } else {
        a.allocationRatio = Number(
          (((a.allocationRatio || 0) / othersSum) * remainingTarget).toFixed(2)
        );
      }
    });

    // 修复由于 toFixed 导致的精度凑不齐 100 的问题
    const currentSum = allocs.reduce((sum, a) => sum + (a.allocationRatio || 0), 0);
    if (currentSum !== 100 && n > 1) {
      const lastOtherIdx = allocs.length - 1 === allocIndex ? allocs.length - 2 : allocs.length - 1;
      const diff = 100 - currentSum;
      allocs[lastOtherIdx].allocationRatio = Number(
        (allocs[lastOtherIdx].allocationRatio + diff).toFixed(2)
      );
    }

    modules[moduleIndex].allocations = allocs;
    form.setFieldsValue({ modules });
  };

  const { mutateAsync: createRule, isPending: isCreating } = useMutation({
    mutationFn: ruleApi.create,
  });

  const { mutateAsync: updateRule, isPending: isUpdating } = useMutation({
    mutationFn: (data: RuleWritePayload) => ruleApi.update(ruleId!, data),
  });

  const { data: ruleData, isLoading: isFetching } = useQuery({
    queryKey: ['profit-sharing-rule', ruleId],
    queryFn: () => ruleApi.getById(ruleId!),
    enabled: !!ruleId,
  });

  React.useEffect(() => {
    if (ruleData) {
      const start = dayjs(ruleData.validStartTime);
      const end = dayjs(ruleData.validEndTime);

      let mode: PeriodMode = 'CUSTOM';
      if (end.year() >= 2090) {
        mode = 'PERMANENT';
      } else if (
        start.format('YYYY-MM') === end.format('YYYY-MM') ||
        (start.date() === 1 &&
          Math.abs(end.diff(start, 'day')) >= 27 &&
          Math.abs(end.diff(start, 'day')) <= 32)
      ) {
        mode = 'MONTH';
      }

      setPeriodMode(mode);

      form.setFieldsValue({
        name: ruleData.name,
        productId: ruleData.productId,
        channelId: ruleData.channelId,
        periodMode: mode,
        monthPicker: start,
        customRange: [start, end],
        permanentStart: start,
        status: ruleData.status,
        modules: ruleData.modules?.map((m: ProfitSharingModule) => ({
          id: m.id,
          name: m.name,
          shareRatio: Number(m.shareRatio) * 100,
          isRefundable: m.isRefundable,
          amortizationType: m.amortizationType ?? 'NONE',
          allocations: m.allocations?.map((a) => ({
            id: a.id,
            memberId: a.memberId,
            allocationRatio: Number(a.allocationRatio) * 100,
          })),
        })),
      });
    } else {
      setPeriodMode('MONTH');
      form.resetFields();
      form.setFieldsValue({
        periodMode: 'MONTH',
        monthPicker: dayjs().startOf('month'),
      });
    }
  }, [ruleData, form]);

  const queryClient = useQueryClient();

  const onFinish = async (values: RuleFormValues) => {
    try {
      const totalModuleRatio =
        values.modules?.reduce((sum: number, m: RuleFormModule) => sum + (m.shareRatio || 0), 0) ||
        0;
      if (totalModuleRatio > 100) {
        message.error('各模块占订单总额比例之和不能超过 100%');
        return;
      }

      if (!values.productId && !values.channelId) {
        message.error('限制品类和限制渠道必须选择一项');
        return;
      }

      let validStartTime: string;
      let validEndTime: string;

      if (periodMode === 'MONTH') {
        const month = values.monthPicker || dayjs();
        validStartTime = month.startOf('month').toISOString();
        validEndTime = month.endOf('month').toISOString();
      } else if (periodMode === 'CUSTOM') {
        const range = values.customRange;
        if (!range || range.length < 2) {
          message.error('请选择生效日期范围');
          return;
        }
        validStartTime = range[0].startOf('day').toISOString();
        validEndTime = range[1].endOf('day').toISOString();
      } else {
        const start = values.permanentStart || dayjs();
        validStartTime = start.startOf('day').toISOString();
        validEndTime = dayjs('2099-12-31T23:59:59.999Z').toISOString();
      }

      // 转换数据格式，适应 API 需求
      const payload = {
        name: values.name,
        productId: values.productId || undefined,
        channelId: values.channelId ? Number(values.channelId) : undefined,
        validStartTime,
        validEndTime,
        status: values.status,
        modules: (values.modules || []).map((m: RuleFormModule) => ({
          id: m.id,
          name: m.name,
          shareRatio: m.shareRatio / 100, // 从百分比转为小数 (例如 4 -> 0.04)
          isRefundable: m.isRefundable ?? true,
          amortizationType: m.amortizationType ?? 'NONE',
          allocations: (m.allocations || []).map((a: RuleFormAllocation) => ({
            id: a.id,
            memberId: a.memberId,
            allocationRatio: a.allocationRatio / 100, // 从百分比转为小数
          })),
        })),
      };

      if (ruleId) {
        await updateRule(payload);
        message.success('规则更新成功');
        queryClient.invalidateQueries({ queryKey: ['profit-sharing-rule', ruleId] });
      } else {
        await createRule(payload);
        message.success('规则创建成功');
      }
      onSuccess();
    } catch {
      message.error(ruleId ? '更新失败，请检查填写内容' : '创建失败，请检查填写内容');
    }
  };

  if (isFetching) {
    return <div className="p-10 text-center text-gray-500">加载中...</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: 'ACTIVE',
        periodMode: 'MONTH',
        monthPicker: dayjs().startOf('month'),
        modules: [
          {
            name: '关单',
            shareRatio: 4,
            isRefundable: true,
            amortizationType: 'NONE',
            allocations: [{ memberId: '', allocationRatio: 100 }],
          },
        ],
      }}
    >
      <Form.Item
        name="name"
        label="规则名称"
        rules={[{ required: true, message: '请输入规则名称' }]}
      >
        <Input placeholder="例如：2023年9月默认分账规则" />
      </Form.Item>

      <Form.Item
        label="生效周期"
        required
        className="mb-4"
        extra={
          <span className="text-xs text-gray-400">
            {periodMode === 'MONTH' && '覆盖自然整月（该月 1 日 00:00:00 至月末 23:59:59）'}
            {periodMode === 'CUSTOM' && '按自然天生效（起止日 00:00:00 至 23:59:59）'}
            {periodMode === 'PERMANENT' && '自生效日起长期持续有效（至 2099 年），直至手动停用'}
          </span>
        }
      >
        <Space direction="vertical" className="w-full" size="small">
          <Segmented
            value={periodMode}
            onChange={(val) => {
              const newMode = val as PeriodMode;
              setPeriodMode(newMode);
              form.setFieldValue('periodMode', newMode);
            }}
            options={[
              { label: '按月生效', value: 'MONTH' },
              { label: '自定义日期', value: 'CUSTOM' },
              { label: '长期有效', value: 'PERMANENT' },
            ]}
            block
          />

          {periodMode === 'MONTH' && (
            <Form.Item
              name="monthPicker"
              noStyle
              rules={[{ required: true, message: '请选择生效月份' }]}
            >
              <DatePicker
                picker="month"
                className="w-full"
                placeholder="选择生效自然月份（例如：2026-09）"
              />
            </Form.Item>
          )}

          {periodMode === 'CUSTOM' && (
            <Form.Item
              name="customRange"
              noStyle
              rules={[{ required: true, message: '请选择生效日期范围' }]}
            >
              <RangePicker
                className="w-full"
                placeholder={['开始日期', '结束日期']}
                presets={[
                  {
                    label: '本月',
                    value: [dayjs().startOf('month'), dayjs().endOf('month')],
                  },
                  {
                    label: '下月',
                    value: [
                      dayjs().add(1, 'month').startOf('month'),
                      dayjs().add(1, 'month').endOf('month'),
                    ],
                  },
                  {
                    label: '本季度 (3个月)',
                    value: [
                      dayjs().startOf('day'),
                      dayjs().startOf('day').add(3, 'months').endOf('day'),
                    ],
                  },
                  {
                    label: '半年',
                    value: [
                      dayjs().startOf('day'),
                      dayjs().startOf('day').add(6, 'months').endOf('day'),
                    ],
                  },
                  {
                    label: '1年',
                    value: [
                      dayjs().startOf('day'),
                      dayjs().startOf('day').add(1, 'year').endOf('day'),
                    ],
                  },
                ]}
              />
            </Form.Item>
          )}

          {periodMode === 'PERMANENT' && (
            <Form.Item
              name="permanentStart"
              noStyle
              rules={[{ required: true, message: '请选择生效开始日期' }]}
            >
              <DatePicker className="w-full" placeholder="选择规则生效开始日期" />
            </Form.Item>
          )}
        </Space>
      </Form.Item>

      <Row gutter={12} className="mb-2">
        <Col span={10}>
          <Form.Item
            name="productId"
            label="品类选择"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value || getFieldValue('channelId')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('品类和渠道至少必须选择一种'));
                },
              }),
            ]}
          >
            <OrderProductSelect />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name="channelId"
            label="渠道选择"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value || getFieldValue('productId')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('品类和渠道至少必须选择一种'));
                },
              }),
            ]}
          >
            <OrderChannelSelect />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="status" label="状态">
            <Select style={{ width: '100%' }}>
              <Select.Option value="ACTIVE">启用</Select.Option>
              <Select.Option value="DRAFT">草稿</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 动态分润模块配置 */}
      <Form.List name="modules">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-4 mb-6">
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                title={`模块配置 ${name + 1}`}
                extra={
                  <MinusCircleOutlined
                    className="text-red-500 text-lg cursor-pointer"
                    onClick={() => remove(name)}
                  />
                }
                className="bg-gray-50 border-gray-200"
              >
                <Space className="w-full mb-4" align="start">
                  <Form.Item {...restField} name={[name, 'id']} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="模块名称"
                    rules={[{ required: true, message: '必填' }]}
                  >
                    <Input placeholder="如：关单" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'shareRatio']}
                    label="占订单总额比例 (%)"
                    rules={[{ required: true, message: '必填' }]}
                  >
                    <InputNumber min={0} max={100} addonAfter="%" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'isRefundable']}
                    label="退款时回扣"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'amortizationType']} label="结算模式">
                    <Select style={{ width: 140 }}>
                      <Select.Option value="NONE">一次性结算</Select.Option>
                      <Select.Option value="MONTHLY">按月摊销</Select.Option>
                      <Select.Option value="END_OF_TERM">服务结束后结算</Select.Option>
                    </Select>
                  </Form.Item>
                </Space>

                {/* 模块内的成员分配比例 */}
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="mb-2 font-medium text-gray-700">收益人分配比例 (模块内占比)</div>
                  <Form.List name={[name, 'allocations']}>
                    {(allocFields, { add: addAlloc, remove: removeAlloc }) => (
                      <>
                        {allocFields.map(
                          ({ key: allocKey, name: allocName, ...restAllocField }) => (
                            <Space key={allocKey} className="w-full mb-2" align="baseline">
                              <Form.Item {...restAllocField} name={[allocName, 'id']} hidden>
                                <Input />
                              </Form.Item>
                              <Form.Item
                                {...restAllocField}
                                name={[allocName, 'memberId']}
                                rules={[{ required: true, message: '请选择成员' }]}
                                style={{ width: 220 }}
                              >
                                <OrderUserSelect placeholder="搜索或选择收益成员" />
                              </Form.Item>
                              <Form.Item
                                {...restAllocField}
                                name={[allocName, 'allocationRatio']}
                                rules={[{ required: true, message: '必填' }]}
                              >
                                <InputNumber
                                  min={0}
                                  max={100}
                                  addonAfter="%"
                                  placeholder="比例"
                                  onChange={(val) => handleAllocationChange(name, allocName, val)}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                className="text-red-500 cursor-pointer"
                                onClick={() => removeAlloc(allocName)}
                              />
                            </Space>
                          )
                        )}
                        <Button
                          type="dashed"
                          onClick={() => addAlloc()}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加收益人
                        </Button>
                      </>
                    )}
                  </Form.List>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
              className="h-12 border-blue-300 text-blue-500 hover:text-blue-600 hover:border-blue-400"
            >
              添加分润模块
            </Button>
          </div>
        )}
      </Form.List>

      <div className="flex justify-end gap-2 mt-8">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
          提交保存
        </Button>
      </div>
    </Form>
  );
};
