/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingRecordResponseDto } from './MeetingRecordResponseDto';
export type MeetingRecordListResponseDto = {
    /**
     * 会议记录列表
     */
    data: Array<MeetingRecordResponseDto>;
    /**
     * 总数
     */
    total: number;
    /**
     * 当前页
     */
    page: number;
    /**
     * 每页数量
     */
    limit: number;
    /**
     * 总页数
     */
    totalPages: number;
};

