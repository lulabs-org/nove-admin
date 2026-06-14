import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Descriptions from 'antd/es/descriptions';
import Card from 'antd/es/card';
import message from 'antd/es/message';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingApi } from '../api/meetingApi';
import type { Meeting } from '../model/types';
import {
  formatDateTime,
  formatDuration,
  getMeetingPlatformText,
  getMeetingTypeText,
  getProcessingStatusText,
} from '../utils/formatters';

export function MeetingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMeetingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await meetingApi.getById(id);
      setMeeting(data);
    } catch {
      message.error('获取会议详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMeetingDetail();
    }
  }, [id, fetchMeetingDetail]);

  const handleEdit = () => {
    message.info('编辑会议功能');
  };

  const handleReprocess = async () => {
    if (!id) return;
    try {
      await meetingApi.reprocess(id);
      message.success('重新处理会议成功');
      fetchMeetingDetail();
    } catch {
      message.error('重新处理会议失败');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await meetingApi.delete(id);
      message.success('删除会议成功');
      navigate('/meetings/list');
    } catch {
      message.error('删除会议失败');
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  if (!meeting) {
    return <div style={{ padding: 24 }}>会议不存在</div>;
  }

  const { text: statusText, color: statusColor } = getProcessingStatusText(
    meeting.processingStatus
  );

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={meeting.title}
        extra={
          <Space>
            <Button onClick={() => navigate('/meetings/list')}>返回列表</Button>
            <Button type="primary" onClick={handleEdit}>
              编辑
            </Button>
            {meeting.processingStatus === 'COMPLETED' && (
              <Button onClick={handleReprocess}>重新处理</Button>
            )}
            <Button danger onClick={handleDelete}>
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="会议ID">{meeting.id}</Descriptions.Item>
          <Descriptions.Item label="会议平台">
            {getMeetingPlatformText(meeting.platform)}
          </Descriptions.Item>
          <Descriptions.Item label="会议类型">{getMeetingTypeText(meeting.type)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <span style={{ color: statusColor }}>{statusText}</span>
          </Descriptions.Item>
          <Descriptions.Item label="主持人">{meeting.hostPlatformUserId || '-'}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{formatDateTime(meeting.startAt)}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{formatDateTime(meeting.endAt)}</Descriptions.Item>
          <Descriptions.Item label="时长">
            {formatDuration(meeting.durationSeconds)}
          </Descriptions.Item>
          <Descriptions.Item label="参与人数">{meeting.participantCount ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {formatDateTime(meeting.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间" span={2}>
            {formatDateTime(meeting.updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {meeting.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="会议摘要" span={2}>
            {meeting.summary || '-'}
          </Descriptions.Item>
        </Descriptions>

        {meeting.recordingUrl && (
          <div style={{ marginTop: 16 }}>
            <h3>会议录制</h3>
            <a href={meeting.recordingUrl} target="_blank" rel="noopener noreferrer">
              查看录制
            </a>
          </div>
        )}

        {meeting.transcriptUrl && (
          <div style={{ marginTop: 16 }}>
            <h3>会议转录</h3>
            <a href={meeting.transcriptUrl} target="_blank" rel="noopener noreferrer">
              查看转录
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
