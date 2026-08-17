import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';
import { TrackingCadence, TRACKING_CADENCE_LABELS } from '../model/types';
import type { TriggerSummaryDto } from '../model/types';

interface GenerateReportModalProps {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (dto: TriggerSummaryDto) => void;
}

interface FormValues {
  periodType: TrackingCadence;
  targetDate?: Dayjs;
  platformUserIds?: string;
}

export function GenerateReportModal({
  open,
  submitting,
  onCancel,
  onSubmit,
}: GenerateReportModalProps) {
  const [form] = Form.useForm<FormValues>();

  const handleOk = async () => {
    const values = await form.validateFields();
    const dto: TriggerSummaryDto = {
      periodType: values.periodType,
      targetDate: values.targetDate?.toISOString(),
      platformUserIds: values.platformUserIds
        ? values.platformUserIds
            .split(/[,\n]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    };
    onSubmit(dto);
  };

  return (
    <Modal
      title="触发周期性报告生成"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="生成"
      cancelText="取消"
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="periodType"
          label="周期类型"
          rules={[{ required: true, message: '请选择周期类型' }]}
        >
          <Select placeholder="选择周期类型">
            {Object.values(TrackingCadence).map((c) => (
              <Select.Option key={c} value={c}>
                {TRACKING_CADENCE_LABELS[c]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="targetDate" label="目标日期（可选，默认取最近一个周期）">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="platformUserIds"
          label="指定平台用户 ID（可选，逗号或换行分隔）"
          extra="不填则为所有用户生成"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            tokenSeparators={[',']}
            placeholder="输入平台用户 ID，按 Enter 或逗号确认"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
