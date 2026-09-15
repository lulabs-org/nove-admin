import { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import DatePicker from 'antd/es/date-picker';
import Form from 'antd/es/form';
import Modal from 'antd/es/modal';
import Popover from 'antd/es/popover';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import message from 'antd/es/message';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  wechatShopSyncApi,
  type WechatSyncKind,
  type WechatSyncTimeField,
} from '../api/wechatShopSyncApi';

interface SyncValues {
  timeField: WechatSyncTimeField;
  dateRange: [Dayjs, Dayjs];
}

export function WechatShopSyncPanel() {
  const { user } = useAuth();
  const [kind, setKind] = useState<WechatSyncKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<SyncValues>();
  if (!user?.roles.includes('SUPER_ADMIN')) return null;

  const close = () => {
    setKind(null);
    form.resetFields();
  };
  const submit = async () => {
    if (!kind || loading) return;
    let values: SyncValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      const response = await wechatShopSyncApi.historySync(kind, {
        [values.timeField]: {
          start_time: values.dateRange[0].startOf('day').toISOString(),
          end_time: values.dateRange[1].endOf('day').toISOString(),
        },
      });
      if (!response.success) throw new Error('同步任务提交失败');
      message.success('同步任务已提交，后台处理完成后可刷新对应列表查看结果');
      close();
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      message.error(
        Array.isArray(detail) ? detail.join('；') : detail || '同步任务提交失败，请稍后重试'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{ marginTop: 24 }}
      title={
        <Space size={6}>
          <span>数据同步</span>
          <Popover
            trigger={['hover', 'focus', 'click']}
            placement="top"
            content={
              <div className="integrations-secret-help">
                <div className="integrations-help-section">
                  <div className="integrations-help-section-title">同步范围</div>
                  <div>
                    按创建时间或更新时间补充微信小店历史订单、售后单。时间范围必填，最多 366
                    天，与列表筛选条件无关。
                  </div>
                </div>
                <div className="integrations-help-section">
                  <div className="integrations-help-section-title">查看结果</div>
                  <div>
                    提交后将在后台处理，可稍后刷新订单列表或订单售后查看结果。提交成功不代表同步完成。
                  </div>
                </div>
              </div>
            }
          >
            <Button
              type="text"
              size="small"
              className="integrations-help-button"
              aria-label="查看微信小店同步说明"
              icon={<QuestionCircleOutlined />}
            />
          </Popover>
        </Space>
      }
    >
      <Space wrap>
        <Button onClick={() => setKind('orders')}>同步订单</Button>
        <Button onClick={() => setKind('aftersale')}>同步售后单</Button>
      </Space>
      <Modal
        title={kind === 'aftersale' ? '同步微信小店售后单' : '同步微信小店订单'}
        open={kind !== null}
        onCancel={close}
        onOk={() => void submit()}
        okText="提交同步任务"
        cancelText="取消"
        confirmLoading={loading}
        closable={!loading}
        maskClosable={!loading}
        keyboard={!loading}
        cancelButtonProps={{ disabled: loading }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ timeField: 'create_time_range' }}>
          <Form.Item label="时间依据" name="timeField" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '创建时间', value: 'create_time_range' },
                { label: '更新时间', value: 'update_time_range' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="时间范围"
            name="dateRange"
            rules={[
              { required: true, message: '请选择时间范围' },
              {
                validator: (_, range?: [Dayjs, Dayjs]) => {
                  if (!range?.[0] || !range[1]) return Promise.resolve();
                  const duration = range[1].endOf('day').diff(range[0].startOf('day'), 'second');
                  return duration > 0 && duration <= 366 * 86400
                    ? Promise.resolve()
                    : Promise.reject(new Error('时间范围须按先后顺序选择，且不能超过 366 天'));
                },
              },
            ]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              presets={[
                { label: '最近 7 天', value: [dayjs().subtract(6, 'day'), dayjs()] },
                { label: '最近 30 天', value: [dayjs().subtract(29, 'day'), dayjs()] },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
