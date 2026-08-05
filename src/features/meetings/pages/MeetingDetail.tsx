import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Descriptions from 'antd/es/descriptions';
import Card from 'antd/es/card';
import Drawer from 'antd/es/drawer';
import message from 'antd/es/message';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingApi } from '../api/meetingApi';
import type { Meeting, TranscriptSegment } from '../model/types';
import {
  formatDateTime,
  formatDuration,
  getMeetingPlatformText,
  getMeetingTypeText,
  getProcessingStatusText,
} from '../utils/formatters';
import './MeetingDetail.css';

export function MeetingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState<Record<string, TranscriptSegment[]>>({});
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [transcriptDrawerRecordingId, setTranscriptDrawerRecordingId] = useState<string | null>(
    null
  );

  const fetchMeetingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await meetingApi.getById(id);
      setMeeting(data);
      setLoading(false);
      setTranscriptDrawerRecordingId(null);
      const recordings = data.recordings || [];
      setTranscripts({});
      setTranscriptError(null);

      if (recordings.length) {
        setTranscriptLoading(true);
        try {
          const results: Array<[string, TranscriptSegment[]]> = await Promise.all(
            recordings.map(
              async (recording): Promise<[string, TranscriptSegment[]]> => [
                recording.id,
                await meetingApi.getTranscript(recording.id),
              ]
            )
          );
          setTranscripts(Object.fromEntries(results));
        } catch {
          setTranscriptError('获取转写记录失败');
        } finally {
          setTranscriptLoading(false);
        }
      }
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

  // 后端 reprocess 接口暂时禁用，见 PR #321
  // const handleReprocess = async () => {
  //   if (!id) return;
  //   try {
  //     await meetingApi.reprocess(id);
  //     message.success('重新处理会议成功');
  //     fetchMeetingDetail();
  //   } catch {
  //     message.error('重新处理会议失败');
  //   }
  // };

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
  const transcriptDrawerRecording = meeting.recordings?.find(
    (recording) => recording.id === transcriptDrawerRecordingId
  );
  const transcriptDrawerSegments = transcriptDrawerRecording
    ? transcripts[transcriptDrawerRecording.id] || []
    : [];
  const hostDisplayName = meeting.host?.displayName || meeting.hostPlatformUserId || '-';

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
            {/* 后端 reprocess 接口暂时禁用，见 PR #321
            {meeting.processingStatus === 'COMPLETED' && (
              <Button onClick={handleReprocess}>重新处理</Button>
            )}
            */}
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
          <Descriptions.Item label="主持人">{hostDisplayName}</Descriptions.Item>
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

        {meeting.recordings?.length ? (
          <section className="meeting-transcripts">
            <h3 className="meeting-transcripts-title">录制与转写</h3>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {meeting.recordings.map((recording, index) => {
                const segments = transcripts[recording.id] || [];
                return (
                  <Card
                    key={recording.id}
                    className="meeting-recording-card"
                    size="small"
                    title={`录制 ${index + 1}${recording.startAt ? ` · ${formatDateTime(recording.startAt)}` : ''}`}
                    extra={
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setTranscriptDrawerRecordingId(recording.id)}
                      >
                        查看完整转写
                      </Button>
                    }
                  >
                    {transcriptLoading ? (
                      <span>正在加载转写记录...</span>
                    ) : transcriptError ? (
                      <span>{transcriptError}</span>
                    ) : segments.length ? (
                      <div className="meeting-transcript-preview">
                        <div className="meeting-transcript-count">
                          共 {segments.length} 条转写记录
                        </div>
                        {segments.slice(0, 3).map((segment, segmentIndex) => (
                          <div
                            className="meeting-transcript-segment"
                            key={`${recording.id}-${segmentIndex}`}
                          >
                            <div className="meeting-transcript-meta">
                              <strong>{segment.speakerName || '未知发言人'}</strong>
                              {segment.startTime ? <span>{segment.startTime}</span> : null}
                            </div>
                            <div className="meeting-transcript-text">{segment.text}</div>
                          </div>
                        ))}
                        {segments.length > 3 ? (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => setTranscriptDrawerRecordingId(recording.id)}
                          >
                            还有 {segments.length - 3} 条记录，查看全部
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <span>暂无转写记录</span>
                    )}
                  </Card>
                );
              })}
            </Space>
          </section>
        ) : null}

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

      <Drawer
        title={
          transcriptDrawerRecording
            ? `完整转写${transcriptDrawerRecording.startAt ? ` · ${formatDateTime(transcriptDrawerRecording.startAt)}` : ''}`
            : '完整转写'
        }
        open={Boolean(transcriptDrawerRecording)}
        onClose={() => setTranscriptDrawerRecordingId(null)}
        width={760}
      >
        {transcriptLoading ? (
          <span>正在加载转写记录...</span>
        ) : transcriptError ? (
          <span>{transcriptError}</span>
        ) : transcriptDrawerSegments.length ? (
          <div className="meeting-transcript-drawer-list">
            {transcriptDrawerSegments.map((segment, segmentIndex) => (
              <div
                className="meeting-transcript-segment"
                key={`${transcriptDrawerRecording?.id}-${segmentIndex}`}
              >
                <div className="meeting-transcript-meta">
                  <strong>{segment.speakerName || '未知发言人'}</strong>
                  {segment.startTime ? <span>{segment.startTime}</span> : null}
                </div>
                <div className="meeting-transcript-text">{segment.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <span>暂无转写记录</span>
        )}
      </Drawer>
    </div>
  );
}
