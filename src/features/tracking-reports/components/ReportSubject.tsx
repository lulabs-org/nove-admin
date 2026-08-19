import { useState } from 'react';
import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import Descriptions from 'antd/es/descriptions';
import Popover from 'antd/es/popover';
import Spin from 'antd/es/spin';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import { IdcardOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { TrackingReportSubject, TrackingReportSubjectSummary } from '../model/types';
import { trackingReportApi } from '../api/trackingReportApi';
import { platformLabel } from '../lib/reportSubject';
import './ReportSubject.css';

const { Text } = Typography;

function localUserPhone(subject: TrackingReportSubject) {
  const user = subject.localUser;
  return user?.phone ? `${user.countryCode ?? ''} ${user.phone}`.trim() : null;
}

function subjectTag(subject: TrackingReportSubjectSummary) {
  if (subject.kind === 'PROJECT') return <Tag color="purple">项目</Tag>;
  if (subject.kind === 'PLATFORM_USER') return <Tag color="orange">平台用户</Tag>;
  return <Tag color="blue">本地用户</Tag>;
}

export function SubjectIdentityDetails({ subject }: { subject: TrackingReportSubject }) {
  const phone = localUserPhone(subject);

  return (
    <Descriptions column={1} size="small" className="report-subject-identities">
      {subject.localUser && (
        <>
          {subject.localUser.username && (
            <Descriptions.Item label="用户名">
              <Text copyable>{subject.localUser.username}</Text>
            </Descriptions.Item>
          )}
          {subject.localUser.email && (
            <Descriptions.Item label="邮箱">
              <Text copyable>{subject.localUser.email}</Text>
            </Descriptions.Item>
          )}
          {phone && (
            <Descriptions.Item label="手机号">
              <Text copyable>{phone}</Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="本地用户 ID">
            <Text copyable>{subject.localUser.id}</Text>
          </Descriptions.Item>
        </>
      )}
      {subject.platformUser && (
        <>
          <Descriptions.Item label="平台来源">
            {platformLabel(subject.platformUser.platform)}
          </Descriptions.Item>
          <Descriptions.Item label="平台用户 ID">
            <Text copyable>{subject.platformUser.id}</Text>
          </Descriptions.Item>
          {subject.platformUser.displayName && (
            <Descriptions.Item label="平台显示名称">
              <Text>{subject.platformUser.displayName}</Text>
            </Descriptions.Item>
          )}
          {subject.platformUser.ptUserId && (
            <Descriptions.Item label="平台账号 ID">
              <Text copyable>{subject.platformUser.ptUserId}</Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="平台 Union ID">
            <Text copyable>{subject.platformUser.ptUnionId}</Text>
          </Descriptions.Item>
        </>
      )}
      {subject.project && (
        <>
          {subject.project.category && (
            <Descriptions.Item label="项目分类">{subject.project.category}</Descriptions.Item>
          )}
          {subject.project.subtitle && (
            <Descriptions.Item label="项目说明">{subject.project.subtitle}</Descriptions.Item>
          )}
          <Descriptions.Item label="项目 ID">
            <Text copyable>{subject.project.id}</Text>
          </Descriptions.Item>
        </>
      )}
      <Descriptions.Item label="历史名称快照">
        <Text>{subject.nameSnapshot}</Text>
      </Descriptions.Item>
    </Descriptions>
  );
}

interface ReportSubjectSummaryProps {
  subject: TrackingReportSubjectSummary;
  size?: 'default' | 'large';
  identityReportId?: string;
}

function SubjectIdentityPopover({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['tracking-reports', reportId, 'subject'],
    queryFn: () => trackingReportApi.getSubject(reportId),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  let content = data ? <SubjectIdentityDetails subject={data} /> : null;
  if (isLoading) {
    content = (
      <div className="report-subject-identity-state">
        <Spin size="small" />
        <Text type="secondary">正在加载身份信息…</Text>
      </div>
    );
  } else if (isError && !data) {
    content = (
      <div className="report-subject-identity-state">
        <Text type="danger">身份信息加载失败</Text>
        <Button type="link" size="small" loading={isFetching} onClick={() => refetch()}>
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <Tooltip title="身份详情">
      <Popover
        title="身份信息"
        content={content}
        trigger="click"
        placement="bottomLeft"
        open={open}
        onOpenChange={setOpen}
        destroyOnHidden
      >
        <Button
          type="text"
          size="small"
          icon={<IdcardOutlined />}
          aria-label="身份详情"
          className="report-subject-identity-action"
        />
      </Popover>
    </Tooltip>
  );
}

export function ReportSubjectSummary({
  subject,
  size = 'default',
  identityReportId,
}: ReportSubjectSummaryProps) {
  return (
    <div className={`report-subject-summary is-${size}`}>
      <Avatar size={size === 'large' ? 48 : 36} src={subject.avatar ?? undefined}>
        {subject.displayName.slice(0, 1)}
      </Avatar>
      <div className="report-subject-main">
        <Text className="report-subject-name" ellipsis={{ tooltip: subject.displayName }}>
          {subject.displayName}
        </Text>
        <div className="report-subject-meta">
          {subjectTag(subject)}
          {identityReportId && <SubjectIdentityPopover reportId={identityReportId} />}
        </div>
      </div>
    </div>
  );
}
