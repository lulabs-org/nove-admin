/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MeetingRecordResponseDto = {
    /**
     * 会议记录ID
     */
    id: string;
    /**
     * 会议平台
     */
    platform: MeetingRecordResponseDto.platform;
    /**
     * 平台会议ID
     */
    meetingId: string;
    /**
     * 子会议ID
     */
    subMeetingId?: Record<string, any>;
    /**
     * 外部系统ID
     */
    externalId?: Record<string, any>;
    /**
     * 会议标题
     */
    title: string;
    /**
     * 会议描述
     */
    description?: Record<string, any>;
    /**
     * 会议号
     */
    meetingCode?: Record<string, any>;
    /**
     * 会议类型
     */
    type: MeetingRecordResponseDto.type;
    /**
     * 会议语言
     */
    language?: Record<string, any>;
    /**
     * 标签
     */
    tags?: Array<string>;
    /**
     * 主持人平台用户ID
     */
    hostPlatformUserId?: Record<string, any>;
    /**
     * 参会人数
     */
    participantCount?: Record<string, any>;
    /**
     * 预定开始时间
     */
    scheduledStartAt?: Record<string, any>;
    /**
     * 预定结束时间
     */
    scheduledEndAt?: Record<string, any>;
    /**
     * 实际开始时间
     */
    startAt?: Record<string, any>;
    /**
     * 实际结束时间
     */
    endAt?: Record<string, any>;
    /**
     * 持续时间（秒）
     */
    durationSeconds?: Record<string, any>;
    /**
     * 时区
     */
    timezone?: Record<string, any>;
    /**
     * 是否有录制
     */
    hasRecording: boolean;
    /**
     * 录制状态
     */
    recordingStatus: MeetingRecordResponseDto.recordingStatus;
    /**
     * 处理状态
     */
    processingStatus: MeetingRecordResponseDto.processingStatus;
    /**
     * 元数据
     */
    metadata?: Record<string, any>;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 更新时间
     */
    updatedAt: string;
    /**
     * 软删除时间
     */
    deletedAt?: Record<string, any>;
};
export namespace MeetingRecordResponseDto {
    /**
     * 会议平台
     */
    export enum platform {
        TENCENT_MEETING = 'TENCENT_MEETING',
        ZOOM = 'ZOOM',
        TEAMS = 'TEAMS',
        DINGTALK = 'DINGTALK',
        FEISHU = 'FEISHU',
        WEBEX = 'WEBEX',
        VOOV = 'VOOV',
        OTHER = 'OTHER',
    }
    /**
     * 会议类型
     */
    export enum type {
        ONE_TIME = 'ONE_TIME',
        RECURRING = 'RECURRING',
        INSTANT = 'INSTANT',
        SCHEDULED = 'SCHEDULED',
        WEBINAR = 'WEBINAR',
    }
    /**
     * 录制状态
     */
    export enum recordingStatus {
        PENDING = 'PENDING',
        PROCESSING = 'PROCESSING',
        COMPLETED = 'COMPLETED',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
    }
    /**
     * 处理状态
     */
    export enum processingStatus {
        PENDING = 'PENDING',
        PROCESSING = 'PROCESSING',
        COMPLETED = 'COMPLETED',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
    }
}

