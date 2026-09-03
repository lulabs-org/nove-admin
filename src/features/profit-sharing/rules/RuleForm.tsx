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
  Alert,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { ruleApi } from './api/ruleApi';
import { OrderUserSelect } from '../../transactions/orders/components/OrderUserSelect';
import { OrderProductSelect } from '../../transactions/orders/components/OrderProductSelect';
import { OrderChannelSelect } from '../../transactions/orders/components/OrderChannelSelect';
import type { ProfitSharingModule, RuleType, AllocationMode, RuleWritePayload } from './types';

const { RangePicker } = DatePicker;

export type PeriodMode = 'MONTH' | 'CUSTOM' | 'PERMANENT';

interface RuleFormProps {
  ruleId?: string | null;
  copyFromRuleId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RuleFormAllocation {
  id?: string;
  memberId: string;
  allocationRatio?: number;
  fixedAmountYuan?: number;
}

interface RuleFormModule {
  id?: string;
  name: string;
  shareRatio?: number;
  fixedAmountYuan?: number;
  isRefundable?: boolean;
  amortizationType?: 'NONE' | 'MONTHLY' | 'END_OF_TERM';
  allocationMode?: AllocationMode;
  fallbackMemberId?: string;
  allocations?: RuleFormAllocation[];
}

interface RuleFormValues {
  name: string;
  ruleType: RuleType;
  productId?: string;
  channelId?: number;
  periodMode: PeriodMode;
  monthPicker?: Dayjs;
  customRange?: [Dayjs, Dayjs];
  permanentStart?: Dayjs;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  modules?: RuleFormModule[];
}

export const RuleForm: React.FC<RuleFormProps> = ({
  ruleId,
  copyFromRuleId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [ruleType, setRuleType] = useState<RuleType>('ORDER_PERCENTAGE');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('MONTH');

  const sourceId = ruleId || copyFromRuleId;
  const isCopying = Boolean(copyFromRuleId && !ruleId);

  const modulesValue = Form.useWatch('modules', form) || [];

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
        ((allocs[lastOtherIdx].allocationRatio || 0) + diff).toFixed(2)
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
    queryKey: ['profit-sharing-rule', sourceId],
    queryFn: () => ruleApi.getById(sourceId!),
    enabled: !!sourceId,
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

      const rType = ruleData.ruleType || 'ORDER_PERCENTAGE';
      setRuleType(rType);
      setPeriodMode(mode);

      form.setFieldsValue({
        name: isCopying ? `${ruleData.name} (副本)` : ruleData.name,
        ruleType: rType,
        productId: ruleData.productId,
        channelId: ruleData.channelId ? Number(ruleData.channelId) : undefined,
        periodMode: mode,
        monthPicker: start,
        customRange: [start, end],
        permanentStart: start,
        status: ruleData.status,
        modules: ruleData.modules?.map((m: ProfitSharingModule) => ({
          id: isCopying ? undefined : m.id,
          name: m.name,
          shareRatio: m.shareRatio !== undefined ? Number(m.shareRatio) * 100 : 0,
          fixedAmountYuan: m.fixedAmount ? m.fixedAmount / 100 : undefined,
          isRefundable: m.isRefundable,
          amortizationType: m.amortizationType ?? 'NONE',
          allocationMode: m.allocationMode || 'FIXED',
          fallbackMemberId:
            m.allocationMode && m.allocationMode !== 'FIXED'
              ? m.allocations?.[0]?.memberId || undefined
              : undefined,
          allocations: m.allocations?.map((a) => ({
            id: isCopying ? undefined : a.id,
            memberId: a.memberId || '',
            allocationRatio:
              a.allocationRatio !== undefined ? Number(a.allocationRatio) * 100 : 100,
            fixedAmountYuan: a.fixedAmount ? a.fixedAmount / 100 : undefined,
          })),
        })),
      });
    } else {
      setRuleType('ORDER_PERCENTAGE');
      setPeriodMode('MONTH');
      form.resetFields();
      form.setFieldsValue({
        ruleType: 'ORDER_PERCENTAGE',
        periodMode: 'MONTH',
        monthPicker: dayjs().startOf('month'),
        modules: [
          {
            name: '关单',
            shareRatio: 4,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'FINANCIAL_CLOSER',
            allocations: [],
          },
          {
            name: '运营',
            shareRatio: 3,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'ORDER_OWNER',
            allocations: [],
          },
        ],
      });
    }
  }, [ruleData, form]);

  const handleRuleTypeChange = (val: RuleType) => {
    setRuleType(val);
    form.setFieldValue('ruleType', val);
    const currentModules = form.getFieldValue('modules') || [];

    if (val === 'FIXED_MONTHLY') {
      if (!currentModules.length || currentModules[0].shareRatio !== undefined) {
        form.setFieldValue('modules', [
          {
            name: '教师固定课酬',
            isRefundable: false,
            amortizationType: 'NONE',
            allocationMode: 'FIXED',
            allocations: [{ memberId: '', fixedAmountYuan: 5000 }],
          },
        ]);
      }
    } else {
      if (!currentModules.length || currentModules[0].fixedAmountYuan !== undefined) {
        form.setFieldValue('modules', [
          {
            name: '关单',
            shareRatio: 4,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'FINANCIAL_CLOSER',
            allocations: [],
          },
          {
            name: '运营',
            shareRatio: 3,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'ORDER_OWNER',
            allocations: [],
          },
        ]);
      }
    }
  };

  const queryClient = useQueryClient();

  const onFinish = async (values: RuleFormValues) => {
    try {
      if (ruleType === 'ORDER_PERCENTAGE') {
        const totalModuleRatio =
          values.modules?.reduce(
            (sum: number, m: RuleFormModule) => sum + (m.shareRatio || 0),
            0
          ) || 0;
        if (totalModuleRatio > 100) {
          message.error('各模块占订单总额比例之和不能超过 100%');
          return;
        }

        if (!values.productId && !values.channelId) {
          message.error('按订单比例分润模式下，限制品类和限制渠道必须至少选择一项');
          return;
        }

        for (let mi = 0; mi < (values.modules || []).length; mi++) {
          const mod = values.modules![mi];
          if (!mod.name) {
            message.error(`模块 ${mi + 1} 请输入模块名称`);
            return;
          }
          if ((mod.shareRatio ?? 0) <= 0) {
            message.error(`模块【${mod.name}】占订单总额比例必须大于 0`);
            return;
          }
          if (mod.allocationMode === 'FIXED') {
            if (!mod.allocations || mod.allocations.length === 0) {
              message.error(`模块【${mod.name}】采用固定分配模式，必须至少添加一位收益人`);
              return;
            }
            const allocSum = mod.allocations.reduce((sum, a) => sum + (a.allocationRatio || 0), 0);
            if (allocSum !== 100) {
              message.error(
                `模块【${mod.name}】内各收益人比例之和必须等于 100%（当前为 ${allocSum}%）`
              );
              return;
            }
            for (let ai = 0; ai < mod.allocations.length; ai++) {
              if (!mod.allocations[ai].memberId) {
                message.error(`模块【${mod.name}】第 ${ai + 1} 位收益人未选择`);
                return;
              }
            }
          }
        }
      } else {
        // 月度固定分账模式校验
        if (!values.modules || values.modules.length === 0) {
          message.error('请至少添加一个固定分账款项');
          return;
        }
        for (let mi = 0; mi < values.modules.length; mi++) {
          const mod = values.modules[mi];
          if (!mod.name) {
            message.error(`款项配置 ${mi + 1} 请填写款项名称`);
            return;
          }
          if (!mod.allocations || mod.allocations.length === 0) {
            message.error(`款项【${mod.name}】请至少添加一位收益成员`);
            return;
          }
          for (let ai = 0; ai < mod.allocations.length; ai++) {
            const alloc = mod.allocations[ai];
            if (!alloc.memberId) {
              message.error(`款项【${mod.name}】第 ${ai + 1} 位收益人未选择`);
              return;
            }
            if (!alloc.fixedAmountYuan || alloc.fixedAmountYuan <= 0) {
              message.error(`款项【${mod.name}】收益人每月固定金额必须大于 0`);
              return;
            }
          }
        }
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
      const payload: RuleWritePayload = {
        name: values.name,
        ruleType,
        productId: values.productId || undefined,
        channelId: values.channelId ? Number(values.channelId) : undefined,
        validStartTime,
        validEndTime,
        status: values.status,
        modules: (values.modules || []).map((m: RuleFormModule) => {
          if (ruleType === 'FIXED_MONTHLY') {
            const totalFixedAmount = (m.allocations || []).reduce(
              (sum, a) => sum + Math.round((a.fixedAmountYuan || 0) * 100),
              0
            );
            return {
              id: m.id,
              name: m.name,
              shareRatio: 0,
              fixedAmount: totalFixedAmount,
              isRefundable: m.isRefundable ?? false,
              amortizationType: m.amortizationType ?? 'NONE',
              allocationMode: 'FIXED' as const,
              allocations: (m.allocations || []).map((a: RuleFormAllocation) => ({
                id: a.id,
                memberId: a.memberId,
                allocationRatio: 1,
                fixedAmount: Math.round((a.fixedAmountYuan || 0) * 100),
              })),
            };
          } else {
            const allocMode = m.allocationMode || 'FIXED';
            let allocs = m.allocations || [];
            if (allocMode !== 'FIXED') {
              allocs = m.fallbackMemberId
                ? [{ memberId: m.fallbackMemberId, allocationRatio: 100 }]
                : [];
            }
            return {
              id: m.id,
              name: m.name,
              shareRatio: (m.shareRatio || 0) / 100, // 从百分比转为小数 (例如 4 -> 0.04)
              isRefundable: m.isRefundable ?? true,
              amortizationType: m.amortizationType ?? 'NONE',
              allocationMode: allocMode,
              allocations: allocs.map((a: RuleFormAllocation) => ({
                id: a.id,
                memberId: a.memberId,
                allocationRatio: (a.allocationRatio || 0) / 100, // 从百分比转为小数
              })),
            };
          }
        }),
      };

      if (ruleId) {
        await updateRule(payload);
        message.success('规则更新成功');
        queryClient.invalidateQueries({ queryKey: ['profit-sharing-rule', ruleId] });
      } else {
        await createRule(payload);
        message.success(isCopying ? '规则复制新建成功' : '规则创建成功');
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
        name: '',
        ruleType: 'ORDER_PERCENTAGE',
        status: 'ACTIVE',
        periodMode: 'MONTH',
        monthPicker: dayjs().startOf('month'),
        modules: [
          {
            name: '关单',
            shareRatio: 4,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'FINANCIAL_CLOSER',
            allocations: [],
          },
          {
            name: '运营',
            shareRatio: 3,
            isRefundable: true,
            amortizationType: 'NONE',
            allocationMode: 'ORDER_OWNER',
            allocations: [],
          },
        ],
      }}
    >
      <Form.Item label="分账模式" required className="mb-4">
        <Segmented
          value={ruleType}
          onChange={(val) => handleRuleTypeChange(val as RuleType)}
          options={[
            {
              label: (
                <div className="py-1 px-3 text-center">
                  <div className="font-medium">按单比例分润</div>
                  <div className="text-xs text-gray-400">
                    依每笔订单金额比例提成（支持随订单责任人/关单人动态归属）
                  </div>
                </div>
              ),
              value: 'ORDER_PERCENTAGE',
            },
            {
              label: (
                <div className="py-1 px-3 text-center">
                  <div className="font-medium">月度固定分账</div>
                  <div className="text-xs text-gray-400">
                    每月固定发放指定金额（如教师每月5000元）
                  </div>
                </div>
              ),
              value: 'FIXED_MONTHLY',
            },
          ]}
          block
        />
      </Form.Item>

      {ruleType === 'FIXED_MONTHLY' && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="月度固定分账模式"
          description="该模式适用于教师月度固定课酬、教研津贴等固定支出，按自然月为指定人员发放固定金额。不依赖单笔订单，支持在规则列表中按需生成或由系统每月自动巡检生成流水。"
        />
      )}

      <Form.Item
        name="name"
        label="规则名称"
        rules={[{ required: true, message: '请输入规则名称' }]}
      >
        <Input
          placeholder={
            ruleType === 'FIXED_MONTHLY'
              ? '例如：2026年9月高阶讲师月度固定课酬规则'
              : '例如：2026年9月默认订单分账规则'
          }
        />
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
            label={ruleType === 'FIXED_MONTHLY' ? '限制品类 (可选)' : '品类选择'}
            rules={
              ruleType === 'ORDER_PERCENTAGE'
                ? [
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('channelId')) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('品类和渠道至少必须选择一种'));
                      },
                    }),
                  ]
                : []
            }
          >
            <OrderProductSelect />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name="channelId"
            label={ruleType === 'FIXED_MONTHLY' ? '限制渠道 (可选)' : '渠道选择'}
            rules={
              ruleType === 'ORDER_PERCENTAGE'
                ? [
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('productId')) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('品类和渠道至少必须选择一种'));
                      },
                    }),
                  ]
                : []
            }
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
            <div className="font-medium text-gray-700">
              {ruleType === 'FIXED_MONTHLY' ? '月度固定分账款项列表' : '各分润模块配置'}
            </div>
            {fields.map(({ key, name, ...restField }) => {
              const currentMod = modulesValue[name] || {};
              const currentAllocMode: AllocationMode = currentMod.allocationMode || 'FIXED';

              return (
                <Card
                  key={key}
                  size="small"
                  title={
                    ruleType === 'FIXED_MONTHLY'
                      ? `款项配置 ${name + 1}`
                      : `模块配置 ${name + 1}：${currentMod.name || '未命名'}`
                  }
                  extra={
                    <MinusCircleOutlined
                      className="text-red-500 text-lg cursor-pointer"
                      onClick={() => remove(name)}
                    />
                  }
                  className="bg-gray-50 border-gray-200"
                >
                  <Form.Item {...restField} name={[name, 'id']} hidden>
                    <Input />
                  </Form.Item>

                  {ruleType === 'ORDER_PERCENTAGE' ? (
                    <>
                      <Row gutter={12} className="mb-3">
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            label="模块名称"
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <Input placeholder="如：运营、关单" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'shareRatio']}
                            label="占订单总额比例 (%)"
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <InputNumber
                              min={0.01}
                              max={100}
                              precision={2}
                              addonAfter="%"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'isRefundable']}
                            label="退款时回扣"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'amortizationType']}
                            label="结算模式"
                          >
                            <Select style={{ width: '100%' }}>
                              <Select.Option value="NONE">一次性结算</Select.Option>
                              <Select.Option value="MONTHLY">按月摊销</Select.Option>
                              <Select.Option value="END_OF_TERM">服务结束后结算</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="bg-white p-4 rounded border border-gray-200">
                        <Form.Item
                          {...restField}
                          name={[name, 'allocationMode']}
                          label={<span className="font-medium text-gray-700">收益人确定方式</span>}
                          className="mb-3"
                        >
                          <Segmented
                            value={currentAllocMode}
                            onChange={(val) => {
                              const newModules = [...(form.getFieldValue('modules') || [])];
                              if (newModules[name]) {
                                newModules[name].allocationMode = val as AllocationMode;
                                form.setFieldsValue({ modules: newModules });
                              }
                            }}
                            options={[
                              {
                                label: '随订单负责人 (推荐：运营/跟单)',
                                value: 'ORDER_OWNER',
                              },
                              {
                                label: '随订单关单人 (推荐：销售/关单)',
                                value: 'FINANCIAL_CLOSER',
                              },
                              {
                                label: '固定人员比例分配',
                                value: 'FIXED',
                              },
                            ]}
                          />
                        </Form.Item>

                        {currentAllocMode === 'ORDER_OWNER' && (
                          <div>
                            <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded mb-3 border border-blue-100">
                              💡 <strong>按订单区分</strong>：每笔订单的该模块分润将
                              <strong> 100% 自动归属该订单负责人（currentOwnerId）</strong>
                              名下，随订单实际由谁负责动态区分，不再均摊。
                            </div>
                            <Form.Item
                              {...restField}
                              name={[name, 'fallbackMemberId']}
                              label="未指定负责人时的兜底人员 (可选)"
                              className="mb-0"
                            >
                              <OrderUserSelect placeholder="可选：当订单未填写负责人时由谁接收" />
                            </Form.Item>
                          </div>
                        )}

                        {currentAllocMode === 'FINANCIAL_CLOSER' && (
                          <div>
                            <div className="text-xs text-indigo-600 bg-indigo-50 p-2.5 rounded mb-3 border border-indigo-100">
                              💡 <strong>按订单区分</strong>：每笔订单的该模块分润将
                              <strong>
                                {' '}
                                100% 自动归属该订单的财务关单/结单人（financialCloserId）
                              </strong>
                              名下，随订单实际关单销售动态区分。
                            </div>
                            <Form.Item
                              {...restField}
                              name={[name, 'fallbackMemberId']}
                              label="未指定关单人时的兜底人员 (可选)"
                              className="mb-0"
                            >
                              <OrderUserSelect placeholder="可选：当订单未记录关单人时由谁接收" />
                            </Form.Item>
                          </div>
                        )}

                        {currentAllocMode === 'FIXED' && (
                          <div>
                            <div className="mb-2 text-xs text-gray-500">
                              指定固定收益人列表及其在模块内的分配占比（总和必须为 100%）：
                            </div>
                            <Form.List name={[name, 'allocations']}>
                              {(allocFields, { add: addAlloc, remove: removeAlloc }) => (
                                <>
                                  {allocFields.map(
                                    ({ key: allocKey, name: allocName, ...restAllocField }) => (
                                      <Space
                                        key={allocKey}
                                        className="w-full mb-2"
                                        align="baseline"
                                      >
                                        <Form.Item
                                          {...restAllocField}
                                          name={[allocName, 'id']}
                                          hidden
                                        >
                                          <Input />
                                        </Form.Item>
                                        <Form.Item
                                          {...restAllocField}
                                          name={[allocName, 'memberId']}
                                          rules={[{ required: true, message: '请选择成员' }]}
                                          style={{ width: 240 }}
                                        >
                                          <OrderUserSelect placeholder="搜索或选择成员" />
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
                                            onChange={(val) =>
                                              handleAllocationChange(name, allocName, val)
                                            }
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
                                    onClick={() => addAlloc({ memberId: '', allocationRatio: 100 })}
                                    block
                                    icon={<PlusOutlined />}
                                  >
                                    添加收益人
                                  </Button>
                                </>
                              )}
                            </Form.List>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Space className="w-full mb-4" align="start">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="款项名称"
                          rules={[{ required: true, message: '必填' }]}
                          style={{ width: 280 }}
                        >
                          <Input placeholder="如：主讲教师固定课酬、教研津贴" />
                        </Form.Item>
                      </Space>

                      {/* 固定分账模式下的教师与固定金额 */}
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <div className="mb-2 font-medium text-gray-700">
                          收益教师与每月固定发放金额
                        </div>
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
                                      rules={[{ required: true, message: '请选择教师/成员' }]}
                                      style={{ width: 240 }}
                                    >
                                      <OrderUserSelect placeholder="搜索或选择教师/成员" />
                                    </Form.Item>
                                    <Form.Item
                                      {...restAllocField}
                                      name={[allocName, 'fixedAmountYuan']}
                                      rules={[{ required: true, message: '请输入每月固定金额' }]}
                                    >
                                      <InputNumber
                                        min={0.01}
                                        precision={2}
                                        prefix="¥"
                                        addonAfter="元/月"
                                        placeholder="如：5000.00"
                                        style={{ width: 180 }}
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
                                onClick={() => addAlloc({ memberId: '', fixedAmountYuan: 5000 })}
                                block
                                icon={<PlusOutlined />}
                              >
                                添加收益教师
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}

            <Button
              type="dashed"
              onClick={() =>
                add(
                  ruleType === 'FIXED_MONTHLY'
                    ? {
                        name: '教师固定课酬',
                        isRefundable: false,
                        amortizationType: 'NONE',
                        allocationMode: 'FIXED',
                        allocations: [{ memberId: '', fixedAmountYuan: 5000 }],
                      }
                    : {
                        name: '运营',
                        shareRatio: 3,
                        isRefundable: true,
                        amortizationType: 'NONE',
                        allocationMode: 'ORDER_OWNER',
                        allocations: [],
                      }
                )
              }
              block
              icon={<PlusOutlined />}
              className="h-12 border-blue-300 text-blue-500 hover:text-blue-600 hover:border-blue-400"
            >
              {ruleType === 'FIXED_MONTHLY' ? '添加固定分账款项' : '添加分润模块'}
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
