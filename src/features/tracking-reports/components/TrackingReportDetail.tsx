import Drawer from 'antd/es/drawer';
import Descriptions from 'antd/es/descriptions';
import Tag from 'antd/es/tag';
import Collapse from 'antd/es/collapse';
import Spin from 'antd/es/spin';
import Card from 'antd/es/card';
import Divider from 'antd/es/divider';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { trackingReportApi } from '../api/trackingReportApi';
import {
  TRACKING_CADENCE_LABELS,
  TRACKING_REPORT_TYPE_LABELS,
  TrackingCadence,
  TrackingReportType,
} from '../model/types';
import { ReportSubjectSummary, SubjectIdentityDetails } from './ReportSubject';
import './TrackingReportDetail.css';

interface TrackingReportDetailProps {
  id: string | null;
  onClose: () => void;
}

export function TrackingReportDetail({ id, onClose }: TrackingReportDetailProps) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['tracking-reports', id],
    queryFn: () => trackingReportApi.getById(id!),
    enabled: !!id,
  });
  const reportContentHtml = report
    ? DOMPurify.sanitize(marked.parse(report.content, { gfm: true }) as string)
    : '';

  return (
    <Drawer title="追踪报告详情" open={!!id} onClose={onClose} width={720} destroyOnHidden>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}
      {report && !isLoading && (
        <div className="tracking-report-detail">
          <Card size="small" className="tracking-report-subject-card">
            <ReportSubjectSummary subject={report.subject} size="large" />
            <Divider />
            <SubjectIdentityDetails subject={report.subject} />
          </Card>

          <Descriptions
            title="报告信息"
            bordered
            column={2}
            size="small"
            className="tracking-report-info"
          >
            <Descriptions.Item label="报告类型">
              {TRACKING_REPORT_TYPE_LABELS[report.trackingType as TrackingReportType] ??
                report.trackingType}
            </Descriptions.Item>
            <Descriptions.Item label="周期单位">
              {TRACKING_CADENCE_LABELS[report.cadence as TrackingCadence] ?? report.cadence}
            </Descriptions.Item>
            <Descriptions.Item label="周期开始">
              {new Date(report.periodStart).toLocaleDateString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="周期结束">
              {new Date(report.periodEnd).toLocaleDateString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="时区">{report.timezone ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="是否最新版本">
              <Tag color={report.isLatest ? 'success' : 'default'}>
                {report.isLatest ? '最新' : '历史'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本号">v{report.version}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(report.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>

          <Collapse
            className="tracking-report-content"
            defaultActiveKey={['content']}
            items={[
              {
                key: 'content',
                label: '报告内容',
                children: (
                  <div
                    className="tracking-report-markdown"
                    dangerouslySetInnerHTML={{ __html: reportContentHtml }}
                  />
                ),
              },
              ...(report.structuredData && Object.keys(report.structuredData).length > 0
                ? [
                    {
                      key: 'structured',
                      label: '结构化数据',
                      children: (
                        <pre
                          style={{
                            background: '#f5f5f5',
                            padding: 12,
                            borderRadius: 4,
                            maxHeight: 300,
                            overflowY: 'auto' as const,
                            fontSize: 12,
                            margin: 0,
                          }}
                        >
                          {JSON.stringify(report.structuredData, null, 2)}
                        </pre>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
