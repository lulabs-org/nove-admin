import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CopyOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Empty from 'antd/es/empty';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Skeleton from 'antd/es/skeleton';
import Space from 'antd/es/space';
import Tabs from 'antd/es/tabs';
import Tag from 'antd/es/tag';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Perm } from '../../../app/guards/Perm';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import { meetingApi } from '../api/meetingApi';
import { MeetingFormModal } from '../components/MeetingFormModal';
import type {
  Meeting,
  MeetingParticipant,
  MeetingSummary,
  TranscriptSegment,
  UpdateMeetingDto,
} from '../model/types';
import {
  formatDateTime,
  formatDuration,
  getMeetingPlatformText,
  getMeetingTypeText,
  getProcessingStatusText,
} from '../utils/formatters';
import './MeetingDetail.css';

function participantName(participant: MeetingParticipant) {
  return (
    participant.user?.displayName ||
    participant.user?.email ||
    participant.user?.ptUserId ||
    '未知成员'
  );
}

function participantContact(participant: MeetingParticipant) {
  const user = participant.user;
  if (!user) return '未关联平台用户';
  return (
    user.email || [user.countryCode, user.phone].filter(Boolean).join(' ') || user.ptUserId || '-'
  );
}

function renderStructuredValue(value: unknown): React.ReactNode {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return (
      <ul className="meeting-structured-list">
        {value.map((item, index) => (
          <li key={index}>{renderStructuredValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;
    const preferred =
      object.point ?? object.task ?? object.decision ?? object.content ?? object.title;
    if (preferred) return String(preferred);
    return Object.entries(object)
      .map(
        ([key, item]) => `${key}: ${typeof item === 'object' ? JSON.stringify(item) : String(item)}`
      )
      .join(' · ');
  }
  return String(value);
}

export function MeetingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [participantTotal, setParticipantTotal] = useState(0);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, TranscriptSegment[]>>({});
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [visibleTranscriptCount, setVisibleTranscriptCount] = useState(200);
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchParticipants = useCallback(
    async (search?: string) => {
      if (!id) return;
      setParticipantsLoading(true);
      try {
        const result = await meetingApi.getParticipants(id, { page: 1, limit: 100, search });
        setParticipants(result.data);
        setParticipantTotal(result.total);
      } catch {
        message.error('获取参会成员失败');
      } finally {
        setParticipantsLoading(false);
      }
    },
    [id]
  );

  const fetchMeetingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await meetingApi.getById(id);
      setMeeting(data);
      setActiveRecordingId(data.recordings?.[0]?.id ?? null);
      setTranscriptError(null);
      setVisibleTranscriptCount(200);

      const [participantResult, summaryResult] = await Promise.allSettled([
        meetingApi.getParticipants(id, { page: 1, limit: 100 }),
        meetingApi.getSummaries(id),
      ]);
      if (participantResult.status === 'fulfilled') {
        setParticipants(participantResult.value.data);
        setParticipantTotal(participantResult.value.total);
      }
      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value.data[0] ?? null);
      }

      const recordings = data.recordings ?? [];
      setTranscripts({});
      if (recordings.length) {
        setTranscriptLoading(true);
        const transcriptResults = await Promise.allSettled(
          recordings.map((recording) => meetingApi.getTranscript(recording.id))
        );
        const transcriptMap: Record<string, TranscriptSegment[]> = {};
        transcriptResults.forEach((result, index) => {
          if (result.status === 'fulfilled') transcriptMap[recordings[index].id] = result.value;
        });
        setTranscripts(transcriptMap);
        if (transcriptResults.every((result) => result.status === 'rejected')) {
          setTranscriptError('转写记录暂时无法读取');
        }
        setTranscriptLoading(false);
      }
    } catch {
      message.error('获取会议详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchMeetingDetail();
  }, [fetchMeetingDetail]);

  const activeRecording = meeting?.recordings?.find((item) => item.id === activeRecordingId);
  const activeTranscriptCount = activeRecordingId
    ? (transcripts[activeRecordingId]?.length ?? 0)
    : 0;
  const allTranscriptSegments = useMemo(
    () => meeting?.recordings?.flatMap((recording) => transcripts[recording.id] ?? []) ?? [],
    [meeting?.recordings, transcripts]
  );

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

  const handleUpdate = async (data: UpdateMeetingDto) => {
    if (!id) return;
    setUpdating(true);
    try {
      await meetingApi.update(id, data);
      message.success('会议更新成功');
      setEditOpen(false);
      await fetchMeetingDetail();
    } catch {
      message.error('会议更新失败');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="meeting-detail-loading">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!meeting)
    return (
      <div className="meeting-detail-loading">
        <Empty description="会议不存在" />
      </div>
    );

  const status = getProcessingStatusText(meeting.processingStatus);
  const hostDisplayName = meeting.host?.displayName || meeting.hostPlatformUserId || '-';

  const summaryPane = summary ? (
    <div className="meeting-summary-pane">
      <div className="meeting-section-heading">
        <div>
          <h2>{summary.title || '会议纪要'}</h2>
          <span>{formatDateTime(summary.updatedAt)}</span>
        </div>
        {summary.keywords?.length ? (
          <Space wrap>
            {summary.keywords.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </Space>
        ) : null}
      </div>
      <div className="meeting-summary-content">{summary.content}</div>
      {summary.keyPoints ? (
        <section>
          <h3>关键要点</h3>
          {renderStructuredValue(summary.keyPoints)}
        </section>
      ) : null}
      {summary.actionItems ? (
        <section>
          <h3>行动项</h3>
          {renderStructuredValue(summary.actionItems)}
        </section>
      ) : null}
      {summary.decisions ? (
        <section>
          <h3>会议决策</h3>
          {renderStructuredValue(summary.decisions)}
        </section>
      ) : null}
    </div>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会议纪要" />
  );

  const participantPane = (
    <div className="meeting-participant-pane">
      <div className="meeting-participant-toolbar">
        <span>共 {participantTotal} 位参会成员</span>
        <Input.Search
          allowClear
          placeholder="搜索姓名、邮箱或手机号"
          onSearch={(value) => void fetchParticipants(value)}
        />
      </div>
      {participantsLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : participants.length ? (
        <div className="meeting-participant-list">
          {participants.map((participant) => (
            <div className="meeting-participant-row" key={participant.id}>
              <Avatar src={participant.user?.avatarUrl}>
                {participantName(participant).slice(0, 1)}
              </Avatar>
              <div className="meeting-participant-identity">
                <strong>{participantName(participant)}</strong>
                <span>{participantContact(participant)}</span>
              </div>
              <div className="meeting-participant-time">
                <span>加入 {formatDateTime(participant.firstJoinTime)}</span>
                <span>离开 {formatDateTime(participant.lastLeaveTime)}</span>
              </div>
              <Tag>{formatDuration(participant.totalDurationSeconds)}</Tag>
            </div>
          ))}
          {participantTotal > participants.length ? (
            <div className="meeting-list-hint">当前展示前 {participants.length} 位成员</div>
          ) : null}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无参会成员记录" />
      )}
    </div>
  );

  const transcriptPane = transcriptLoading ? (
    <Skeleton active paragraph={{ rows: 8 }} />
  ) : transcriptError ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={transcriptError} />
  ) : allTranscriptSegments.length ? (
    <div className="meeting-transcript-list">
      {allTranscriptSegments.slice(0, visibleTranscriptCount).map((segment, index) => (
        <div className="meeting-transcript-segment" key={`${segment.startTime}-${index}`}>
          <Avatar size={30}>{(segment.speakerName || '?').slice(0, 1)}</Avatar>
          <div>
            <div className="meeting-transcript-meta">
              <strong>{segment.speakerName || '未知发言人'}</strong>
              <span>{segment.startTime || ''}</span>
            </div>
            <div className="meeting-transcript-text">{segment.text}</div>
          </div>
        </div>
      ))}
      {visibleTranscriptCount < allTranscriptSegments.length ? (
        <Button
          block
          className="meeting-transcript-more"
          onClick={() => setVisibleTranscriptCount((count) => count + 200)}
        >
          再显示 {Math.min(200, allTranscriptSegments.length - visibleTranscriptCount)} 条
        </Button>
      ) : null}
    </div>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无转写记录" />
  );

  return (
    <div className="meeting-detail-page">
      <header className="meeting-detail-header">
        <div className="meeting-detail-title-group">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/meetings/list')}
          >
            返回
          </Button>
          <div>
            <h1>{meeting.title}</h1>
            <div className="meeting-detail-meta">
              <span>
                <CalendarOutlined /> {formatDateTime(meeting.startAt)}
              </span>
              {meeting.meetingCode ? <span>{meeting.meetingCode}</span> : null}
              <span>
                <TeamOutlined /> {participantTotal || meeting.participantCount || 0} 人
              </span>
              <Tag color={status.color}>{status.text}</Tag>
            </div>
          </div>
        </div>
        <Space wrap>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
              message.success('详情链接已复制');
            }}
          >
            复制链接
          </Button>
          <Perm permission={PERMISSIONS.MEETING.UPDATE}>
            <Button type="primary" icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
              编辑
            </Button>
          </Perm>
          <Perm permission={PERMISSIONS.MEETING.DELETE}>
            <Popconfirm title="确定删除这个会议吗？" onConfirm={handleDelete}>
              <Button danger>删除</Button>
            </Popconfirm>
          </Perm>
        </Space>
      </header>

      <main className="meeting-workspace">
        <Card className="meeting-content-card" styles={{ body: { padding: 0 } }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'summary', label: '纪要', children: summaryPane },
              {
                key: 'participants',
                label: `参会成员 ${participantTotal || ''}`,
                children: participantPane,
              },
              {
                key: 'transcript',
                label: `逐字稿 ${allTranscriptSegments.length || ''}`,
                children: transcriptPane,
              },
            ]}
          />
        </Card>

        <aside className="meeting-media-column">
          <div className="meeting-player">
            <div className="meeting-player-overlay">
              <PlayCircleOutlined />
              <strong>{activeRecording ? '会议录制' : '暂无录制'}</strong>
              <span>
                {activeRecording
                  ? `${formatDateTime(activeRecording.startAt)} · ${activeTranscriptCount} 条转写`
                  : '该会议没有可用录制记录'}
              </span>
            </div>
            {activeRecording ? (
              <div className="meeting-player-bar">
                <span>{activeRecording.status || '未知状态'}</span>
                <Button type="link" onClick={() => setActiveTab('transcript')}>
                  查看转写
                </Button>
              </div>
            ) : null}
          </div>

          {meeting.recordings?.length ? (
            <div className="meeting-recording-selector">
              {meeting.recordings.map((recording, index) => (
                <button
                  type="button"
                  className={recording.id === activeRecordingId ? 'active' : ''}
                  key={recording.id}
                  onClick={() => setActiveRecordingId(recording.id)}
                >
                  <PlayCircleOutlined />
                  <span>
                    <strong>录制 {index + 1}</strong>
                    <small>{formatDateTime(recording.startAt)}</small>
                  </span>
                  <Tag>{recording.status || '-'}</Tag>
                </button>
              ))}
            </div>
          ) : null}

          <Card className="meeting-info-card" title="会议信息" size="small">
            <dl>
              <div>
                <dt>平台</dt>
                <dd>{getMeetingPlatformText(meeting.platform)}</dd>
              </div>
              <div>
                <dt>类型</dt>
                <dd>{getMeetingTypeText(meeting.type)}</dd>
              </div>
              <div>
                <dt>主持人</dt>
                <dd>{hostDisplayName}</dd>
              </div>
              <div>
                <dt>时长</dt>
                <dd>{formatDuration(meeting.durationSeconds)}</dd>
              </div>
              <div>
                <dt>结束时间</dt>
                <dd>{formatDateTime(meeting.endAt)}</dd>
              </div>
              <div>
                <dt>会议 ID</dt>
                <dd title={meeting.id}>{meeting.id}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </main>

      <MeetingFormModal
        open={editOpen}
        meeting={meeting}
        submitting={updating}
        onCancel={() => setEditOpen(false)}
        onSubmit={(data) => void handleUpdate(data as UpdateMeetingDto)}
      />
    </div>
  );
}
