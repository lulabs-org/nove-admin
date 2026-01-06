/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetingRecordListResponseDto } from '../models/MeetingRecordListResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MeetService {
    /**
     * 获取会议记录列表
     * 根据查询条件获取会议记录列表，支持分页、筛选和排序
     * @param platform 会议平台
     * @param status 会议状态
     * @param type 会议类型
     * @param startDate 开始日期 (YYYY-MM-DD)
     * @param endDate 结束日期 (YYYY-MM-DD)
     * @param page 页码，从1开始
     * @param limit 每页数量
     * @param search 搜索关键词（会议主题、主持人等）
     * @returns MeetingRecordListResponseDto 获取成功
     * @throws ApiError
     */
    public static meetingControllerGetMeetingRecords(
        platform?: 'TENCENT_MEETING' | 'ZOOM' | 'TEAMS' | 'DINGTALK' | 'FEISHU' | 'WEBEX' | 'VOOV' | 'OTHER',
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SKIPPED',
        type?: 'ONE_TIME' | 'RECURRING' | 'INSTANT' | 'SCHEDULED' | 'WEBINAR',
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): CancelablePromise<MeetingRecordListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meetings',
            query: {
                'platform': platform,
                'status': status,
                'type': type,
                'startDate': startDate,
                'endDate': endDate,
                'page': page,
                'limit': limit,
                'search': search,
            },
            errors: {
                400: `请求参数错误`,
            },
        });
    }
    /**
     * 创建会议记录
     * 手动创建会议记录
     * @param requestBody 会议记录创建参数
     * @returns any 创建成功
     * @throws ApiError
     */
    public static meetingControllerCreateMeetingRecord(
        requestBody: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meetings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                409: `会议记录已存在`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 获取会议记录详情
     * 根据会议记录ID获取详细信息，包括文件列表和参会者信息
     * @param id 会议记录ID
     * @returns any 获取成功
     * @throws ApiError
     */
    public static meetingControllerGetMeetingRecordById(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meetings/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `会议记录不存在`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 更新会议记录
     * 更新会议记录信息
     * @param id 会议记录ID
     * @param requestBody 会议记录更新参数
     * @returns any 更新成功
     * @throws ApiError
     */
    public static meetingControllerUpdateMeetingRecord(
        id: string,
        requestBody: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/meetings/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `会议记录不存在`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 删除会议记录
     * 删除指定的会议记录及其关联的文件
     * @param id 会议记录ID
     * @returns void
     * @throws ApiError
     */
    public static meetingControllerDeleteMeetingRecord(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/meetings/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `会议记录不存在`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 获取会议统计信息
     * 获取会议记录的统计信息，包括总数、各平台分布、状态分布等
     * @param startDate 统计开始日期 (YYYY-MM-DD)
     * @param endDate 统计结束日期 (YYYY-MM-DD)
     * @returns any 获取成功
     * @throws ApiError
     */
    public static meetingControllerGetMeetingStats(
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<{
        /**
         * 总会议数
         */
        total?: number;
        /**
         * 各平台会议数统计
         */
        platformStats?: Record<string, any>;
        /**
         * 各状态会议数统计
         */
        statusStats?: Record<string, any>;
        /**
         * 各类型会议数统计
         */
        typeStats?: Record<string, any>;
        /**
         * 最近的会议记录
         */
        recentMeetings?: any[];
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meetings/stats/summary',
            query: {
                'startDate': startDate,
                'endDate': endDate,
            },
            errors: {
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 重新处理会议录制文件
     * 重新处理指定会议的录制文件，重新生成AI摘要和转录等
     * @param id 会议记录ID
     * @returns any 重新处理成功
     * @throws ApiError
     */
    public static meetingControllerReprocessMeetingRecord(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meetings/{id}/reprocess',
            path: {
                'id': id,
            },
            errors: {
                404: `会议记录不存在`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 健康检查
     * 检查会议服务的运行状态
     * @returns any 服务正常运行
     * @throws ApiError
     */
    public static meetingControllerHealthCheck(): CancelablePromise<{
        status?: string;
        timestamp?: string;
        service?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meetings/health',
            errors: {
                500: `服务器内部错误`,
            },
        });
    }
}
