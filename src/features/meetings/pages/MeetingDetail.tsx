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
import Select from 'antd/es/select';
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
  MinuteParticipantSummary,
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
  const [participantResultTotal, setParticipantResultTotal] = useState(0);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantSummaries, setParticipantSummaries] = useState<
    Record<string, MinuteParticipantSummary[]>
  >({});
  const [participantSummariesLoading, setParticipantSummariesLoading] = useState(false);
  const [participantSummariesError, setParticipantSummariesError] = useState<string | null>(null);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, TranscriptSegment[]>>({});
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
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
      const normalizedSearch = search?.trim() ?? '';
      setParticipantsLoading(true);
      try {
        const result = await meetingApi.getParticipants(id, {
          page: 1,
          limit: 100,
          search: normalizedSearch || undefined,
        });
        setParticipants(result.data);
        setParticipantResultTotal(result.total);
        setParticipantSearch(normalizedSearch);
        if (!normalizedSearch) setParticipantTotal(result.total);
      } catch {
        message.error('获取参会成员失败');
      } finally {
        setParticipantsLoading(false);
      }
    },
    [id]
  );

  const fetchTranscript = useCallback(async (recordingId: string) => {
    setTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const segments = await meetingApi.getTranscript(recordingId);
      setTranscripts((current) => ({ ...current, [recordingId]: segments }));
    } catch {
      setTranscriptError('转写记录暂时无法读取');
    } finally {
      setTranscriptLoading(false);
    }
  }, []);

  const fetchMeetingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await meetingApi.getById(id);
      setMeeting(data);
      setActiveRecordingId(data.minutes?.[0]?.id ?? null);
      setTranscriptError(null);
      setVisibleTranscriptCount(200);
      setTranscripts({});
      setParticipantSummaries({});
      setParticipantSummariesError(null);
      setExpandedParticipantId(null);
      setLoading(false);

      setParticipantsLoading(true);
      setSummaryLoading(true);
      const participantRequest = meetingApi
        .getParticipants(id, { page: 1, limit: 100 })
        .then((result) => {
          setParticipants(result.data);
          setParticipantTotal(result.total);
          setParticipantResultTotal(result.total);
          setParticipantSearch('');
        })
        .finally(() => setParticipantsLoading(false));
      const summaryRequest = meetingApi
        .getSummaries(id)
        .then((result) => setSummary(result.data[0] ?? null))
        .finally(() => setSummaryLoading(false));

      await Promise.allSettled([participantRequest, summaryRequest]);
    } catch {
      message.error('获取会议详情失败');
    } finally {
      setLoading(false);
      setParticipantsLoading(false);
      setSummaryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchMeetingDetail();
  }, [fetchMeetingDetail]);

  useEffect(() => {
    if (
      activeTab !== 'transcript' ||
      !activeRecordingId ||
      activeRecordingId in transcripts ||
      transcriptLoading
    ) {
      return;
    }
    void fetchTranscript(activeRecordingId);
  }, [activeRecordingId, activeTab, fetchTranscript, transcriptLoading, transcripts]);

  useEffect(() => {
    if (
      activeTab !== 'participants' ||
      !id ||
      !activeRecordingId ||
      activeRecordingId in participantSummaries ||
      participantSummariesLoading
    ) {
      return;
    }
    setParticipantSummariesLoading(true);
    setParticipantSummariesError(null);
    meetingApi
      .getParticipantSummaries(activeRecordingId)
      .then((result) => {
        setParticipantSummaries((current) => ({
          ...current,
          [activeRecordingId]: result.data,
        }));
      })
      .catch(() => setParticipantSummariesError('当前录制的成员总结暂时无法读取'))
      .finally(() => setParticipantSummariesLoading(false));
  }, [activeRecordingId, activeTab, id, participantSummaries, participantSummariesLoading]);

  const activeRecording = meeting?.minutes?.find((item) => item.id === activeRecordingId);
  const activeTranscriptCount = activeRecordingId
    ? (transcripts[activeRecordingId]?.length ?? 0)
    : 0;
  const allTranscriptSegments = useMemo(
    () => meeting?.minutes?.flatMap((recording) => transcripts[recording.id] ?? []) ?? [],
    [meeting?.minutes, transcripts]
  );
  const selectedTranscriptSegments = activeRecordingId
    ? (transcripts[activeRecordingId] ?? [])
    : [];

  const selectRecording = (recordingId: string) => {
    setActiveRecordingId(recordingId);
    setTranscriptError(null);
    setVisibleTranscriptCount(200);
    setExpandedParticipantId(null);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await meetingApi.delete(id);
      message.success('删除会议成功');
      navigate('/meetings');
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
  const recordingStatus = getProcessingStatusText(meeting.recordingStatus);
  const hostDisplayName = meeting.host?.displayName || meeting.host?.platformUserId || '-';
  const derivedDurationSeconds = (() => {
    if (meeting.durationSeconds) return meeting.durationSeconds;
    if (!meeting.startAt || !meeting.endAt) return null;
    const start = new Date(meeting.startAt).getTime();
    const end = new Date(meeting.endAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return Math.round((end - start) / 1000);
  })();

  const copyInfoValue = async (label: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      message.success(`${label}已复制`);
    } catch {
      message.error(`${label}复制失败`);
    }
  };

  const summaryPane = summaryLoading ? (
    <Skeleton active paragraph={{ rows: 8 }} />
  ) : summary ? (
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

  const currentParticipantSummaries = activeRecordingId
    ? (participantSummaries[activeRecordingId] ?? [])
    : [];
  const summaryForParticipant = (participant: MeetingParticipant) =>
    currentParticipantSummaries.find(
      (item) =>
        item.meetingParticipantId === participant.id ||
        item.platformUserId === participant.ptUserId ||
        item.platformUserId === participant.user?.ptUserId
    );

  const participantPane = (
    <div className="meeting-participant-pane">
      <div className="meeting-participant-toolbar">
        <div className="meeting-participant-counts">
          <span>共 {participantTotal} 位参会成员</span>
          {participantSearch ? <small>筛选出 {participantResultTotal} 位</small> : null}
          {activeRecording ? (
            <small>
              录制 {Math.max(0, meeting.minutes?.indexOf(activeRecording) ?? 0) + 1} · 已生成{' '}
              {currentParticipantSummaries.length} 份总结
            </small>
          ) : null}
        </div>
        <Input.Search
          allowClear
          placeholder="搜索姓名、邮箱或手机号"
          onSearch={(value) => void fetchParticipants(value)}
          onChange={(event) => {
            if (!event.target.value && participantSearch) void fetchParticipants();
          }}
        />
      </div>
      {participantSummariesError ? (
        <div className="meeting-participant-summary-error">{participantSummariesError}</div>
      ) : null}
      {participantsLoading || participantSummariesLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : participants.length ? (
        <div className="meeting-participant-list">
          {participants.map((participant) => {
            const participantSummary = summaryForParticipant(participant);
            const expanded = expandedParticipantId === participant.id;
            return (
              <div className="meeting-participant-item" key={participant.id}>
                <div className="meeting-participant-row">
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
                  <div className="meeting-participant-actions">
                    <Tag>{formatDuration(participant.totalDurationSeconds)}</Tag>
                    {participantSummary ? (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setExpandedParticipantId(expanded ? null : participant.id)}
                      >
                        {expanded ? '收起总结' : '查看总结'}
                      </Button>
                    ) : (
                      <span className="meeting-participant-summary-empty">暂无总结</span>
                    )}
                  </div>
                </div>
                {participantSummary && expanded ? (
                  <div className="meeting-participant-summary">
                    {participantSummary.keywords.length ? (
                      <Space size={[4, 4]} wrap>
                        {participantSummary.keywords.map((keyword) => (
                          <Tag key={keyword}>{keyword}</Tag>
                        ))}
                      </Space>
                    ) : null}
                    <p>{participantSummary.partSummary}</p>
                    <small>更新于 {formatDateTime(participantSummary.updatedAt)}</small>
                  </div>
                ) : null}
              </div>
            );
          })}
          {!participantSearch && participantTotal > participants.length ? (
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
  ) : meeting.minutes?.length ? (
    <div className="meeting-transcript-pane">
      <div className="meeting-transcript-recordings" role="group" aria-label="选择录制逐字稿">
        {meeting.minutes.map((recording, index) => {
          const count = transcripts[recording.id]?.length ?? 0;
          const loaded = recording.id in transcripts;
          return (
            <button
              type="button"
              className={recording.id === activeRecordingId ? 'active' : ''}
              key={recording.id}
              onClick={() => selectRecording(recording.id)}
            >
              <span>录制 {index + 1}</span>
              <small>{loaded ? `${count} 条` : '未加载'}</small>
            </button>
          );
        })}
      </div>
      <div className="meeting-transcript-current-meta">
        <span>
          {activeRecording ? `录制开始于 ${formatDateTime(activeRecording.startAt)}` : '请选择录制'}
        </span>
        <strong>本录制共 {selectedTranscriptSegments.length} 条转写</strong>
      </div>
      {selectedTranscriptSegments.length ? (
        <div className="meeting-transcript-list">
          {selectedTranscriptSegments.slice(0, visibleTranscriptCount).map((segment, index) => (
            <div
              className="meeting-transcript-segment"
              key={`${activeRecordingId}-${segment.startTime}-${index}`}
            >
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
          {visibleTranscriptCount < selectedTranscriptSegments.length ? (
            <Button
              block
              className="meeting-transcript-more"
              onClick={() => setVisibleTranscriptCount((count) => count + 200)}
            >
              再显示 {Math.min(200, selectedTranscriptSegments.length - visibleTranscriptCount)} 条
            </Button>
          ) : null}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前录制暂无逐字稿" />
      )}
    </div>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无录制与逐字稿" />
  );

  const infoPane = (
    <div className="meeting-info-pane">
      <section className="meeting-info-section">
        <h3>会议概览</h3>
        <div className="meeting-info-highlights">
          <div>
            <span>会议平台</span>
            <strong>{getMeetingPlatformText(meeting.platform)}</strong>
          </div>
          <div>
            <span>会议类型</span>
            <strong>{getMeetingTypeText(meeting.type)}</strong>
          </div>
          <div>
            <span>主持人</span>
            <strong title={hostDisplayName}>{hostDisplayName}</strong>
          </div>
          <div>
            <span>参会人数</span>
            <strong>{participantTotal || meeting.participantCount || 0} 人</strong>
          </div>
        </div>
      </section>

      <section className="meeting-info-section">
        <h3>时间安排</h3>
        <div className="meeting-info-time-range">
          <div>
            <span>开始</span>
            <strong>{formatDateTime(meeting.startAt)}</strong>
          </div>
          <div className="meeting-info-time-line" aria-hidden="true" />
          <div>
            <span>结束</span>
            <strong>{formatDateTime(meeting.endAt)}</strong>
          </div>
          <Tag>{formatDuration(derivedDurationSeconds)}</Tag>
        </div>
      </section>

      <section className="meeting-info-section">
        <h3>处理状态</h3>
        <div className="meeting-info-processing">
          <div>
            <span>会议数据</span>
            <Tag color={status.color}>{status.text}</Tag>
          </div>
          <div>
            <span>录制数据</span>
            <Tag color={recordingStatus.color}>{recordingStatus.text}</Tag>
          </div>
        </div>
      </section>

      <section className="meeting-info-section">
        <h3>会议标识</h3>
        <div className="meeting-info-identifiers">
          {(
            [
              ['会议号', meeting.meetingCode],
              ['平台会议 ID', meeting.meetingId],
              ['内部会议 ID', meeting.id],
              ['子会议 ID', meeting.subMeetingId],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <code title={value || undefined}>{value || '-'}</code>
              {value ? (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  aria-label={`复制${label}`}
                  onClick={() => void copyInfoValue(label, value)}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="meeting-info-section meeting-info-system">
        <h3>其他信息</h3>
        <dl>
          <div>
            <dt>语言</dt>
            <dd>{meeting.language || '-'}</dd>
          </div>
          <div>
            <dt>时区</dt>
            <dd>{meeting.timezone || '-'}</dd>
          </div>
          <div>
            <dt>创建时间</dt>
            <dd>{formatDateTime(meeting.createdAt)}</dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{formatDateTime(meeting.updatedAt)}</dd>
          </div>
        </dl>
      </section>
      {meeting.description ? (
        <section className="meeting-info-description">
          <h3>会议描述</h3>
          <p>{meeting.description}</p>
        </section>
      ) : null}
    </div>
  );

  return (
    <div className="meeting-detail-page">
      <header className="meeting-detail-header">
        <div className="meeting-detail-title-group">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/meetings')}>
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
              { key: 'info', label: '会议信息', children: infoPane },
            ]}
          />
        </Card>

        <aside className="meeting-media-column">
          <div className="meeting-player">
            {meeting.minutes?.length ? (
              <div className="meeting-player-topbar">
                <span>共 {meeting.minutes.length} 个录制</span>
                <Select
                  aria-label="选择会议录制"
                  size="small"
                  value={activeRecordingId ?? undefined}
                  options={meeting.minutes.map((recording, index) => ({
                    value: recording.id,
                    label: `录制 ${index + 1} · ${
                      recording.id in transcripts
                        ? `${transcripts[recording.id]?.length ?? 0} 条`
                        : '未加载'
                    }`,
                  }))}
                  onChange={selectRecording}
                  popupMatchSelectWidth={false}
                />
              </div>
            ) : null}
            <div className="meeting-player-overlay">
              <PlayCircleOutlined />
              <strong>{activeRecording ? '会议录制' : '暂无录制'}</strong>
              <span>
                {activeRecording
                  ? `${formatDateTime(activeRecording.startAt)} · ${
                      activeRecording.id in transcripts
                        ? `${activeTranscriptCount} 条转写`
                        : '逐字稿未加载'
                    }`
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
