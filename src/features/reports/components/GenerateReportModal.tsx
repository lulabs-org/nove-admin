import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import Switch from 'antd/es/switch';
import type { Dayjs } from 'dayjs';
import {
  TrackingCadence,
  TRACKING_CADENCE_LABELS,
  TrackingReportType,
  TRACKING_REPORT_TYPE_LABELS,
} from '../model/types';
import type { TriggerSummaryDto } from '../model/types';
import { ReportSubjectMultiSelect } from './UserSearchSelect';
import type { UserFilterValue } from './UserSearchSelect';

interface GenerateReportModalProps {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (dto: TriggerSummaryDto) => void;
}

interface FormValues {
  cadence: TrackingCadence;
  baseDate?: Dayjs;
  trackingType: TrackingReportType;
  subjects?: UserFilterValue[];
  force?: boolean;
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
      cadence: values.cadence,
      baseDate: values.baseDate?.toISOString(),
      trackingType: values.trackingType,
      platformUserIds: values.subjects?.flatMap((item) =>
        item.platformUserId ? [item.platformUserId] : []
      ),
      subjectUserIds: values.subjects?.flatMap((item) =>
        item.subjectUserId ? [item.subjectUserId] : []
      ),
      force: values.force,
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
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{
          trackingType: TrackingReportType.PERIODIC_MEETING_SUMMARY,
          cadence: TrackingCadence.DAILY,
          force: false,
        }}
      >
        <Form.Item
          name="trackingType"
          label="报告类型"
          rules={[{ required: true, message: '请选择报告类型' }]}
        >
          <Select placeholder="选择报告类型">
            {Object.values(TrackingReportType)
              .filter((type) => type !== TrackingReportType.PROJECT_PROGRESS)
              .map((type) => (
                <Select.Option key={type} value={type}>
                  {TRACKING_REPORT_TYPE_LABELS[type]}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="cadence"
          label="周期单位"
          rules={[{ required: true, message: '请选择周期单位' }]}
        >
          <Select placeholder="选择周期单位">
            {Object.values(TrackingCadence).map((c) => (
              <Select.Option key={c} value={c}>
                {TRACKING_CADENCE_LABELS[c]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="baseDate" label="基准日期（可选，默认取当前日期）">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="subjects"
          label="报告对象（可选）"
          extra="支持搜索本地用户和平台身份；不选择则为全部用户生成"
        >
          <ReportSubjectMultiSelect />
        </Form.Item>

        <Form.Item name="force" label="重新生成" valuePropName="checked">
          <Switch checkedChildren="覆盖生成" unCheckedChildren="正常生成" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
