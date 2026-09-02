import React from 'react';
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
  validTime: [Dayjs, Dayjs];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  modules?: RuleFormModule[];
}

export const RuleForm: React.FC<RuleFormProps> = ({ ruleId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();

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
      form.setFieldsValue({
        name: ruleData.name,
        productId: ruleData.productId,
        channelId: ruleData.channelId,
        validTime: [dayjs(ruleData.validStartTime), dayjs(ruleData.validEndTime)],
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
      form.resetFields();
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

      // 转换数据格式，适应 API 需求
      const payload = {
        name: values.name,
        productId: values.productId || undefined,
        channelId: values.channelId ? Number(values.channelId) : undefined,
        validStartTime: values.validTime[0].toISOString(),
        validEndTime: values.validTime[1].toISOString(),
        status: values.status,
        modules: values.modules?.map((m: RuleFormModule) => ({
          id: m.id,
          name: m.name,
          shareRatio: m.shareRatio / 100, // 从百分比转为小数 (例如 4 -> 0.04)
          isRefundable: m.isRefundable ?? true,
          amortizationType: m.amortizationType ?? 'NONE',
          allocations: m.allocations?.map((a: RuleFormAllocation) => ({
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
        name="validTime"
        label="生效时间范围"
        rules={[{ required: true, message: '请选择生效时间范围' }]}
      >
        <RangePicker
          showTime
          className="w-full"
          presets={[
            {
              label: '1个月',
              value: [dayjs().startOf('day'), dayjs().startOf('day').add(1, 'month')],
            },
            {
              label: '3个月',
              value: [dayjs().startOf('day'), dayjs().startOf('day').add(3, 'months')],
            },
            {
              label: '半年',
              value: [dayjs().startOf('day'), dayjs().startOf('day').add(6, 'months')],
            },
            {
              label: '1年',
              value: [dayjs().startOf('day'), dayjs().startOf('day').add(1, 'year')],
            },
            {
              label: '长期 (99年)',
              value: [dayjs().startOf('day'), dayjs().startOf('day').add(99, 'years')],
            },
          ]}
        />
      </Form.Item>

      <Space className="w-full mb-4" size="large">
        <Form.Item name="productId" label="限制品类 (可选)" className="w-64">
          <OrderProductSelect />
        </Form.Item>
        <Form.Item name="channelId" label="限制渠道 (可选)" className="w-64">
          <OrderChannelSelect />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select style={{ width: 120 }}>
            <Select.Option value="ACTIVE">启用</Select.Option>
            <Select.Option value="DRAFT">草稿</Select.Option>
          </Select>
        </Form.Item>
      </Space>

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
