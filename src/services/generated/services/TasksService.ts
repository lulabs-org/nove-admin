/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCronDto } from '../models/CreateCronDto';
import type { CreateOnceDto } from '../models/CreateOnceDto';
import type { UpdateTaskDto } from '../models/UpdateTaskDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TasksService {
    /**
     * 任务服务健康检查
     * 检查任务服务是否正常运行
     * @returns any 服务正常运行
     * @throws ApiError
     */
    public static tasksControllerHealth(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tasks/health',
        });
    }
    /**
     * 创建一次性任务（在指定时间点执行）
     * 创建一个在指定时间点执行的一次性任务，任务将在指定的ISO 8601时间自动执行
     * @param requestBody 一次性任务创建参数
     * @returns any 已创建的一次性任务
     * @throws ApiError
     */
    public static tasksControllerCreateOnce(
        requestBody: CreateOnceDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tasks/once',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 创建 Cron 任务（pattern/cron 周期执行）
     * 创建一个按照Cron表达式周期性执行的任务，使用上海时区(Asia/Shanghai)
     * @param requestBody Cron任务创建参数
     * @returns any 已创建的周期任务
     * @throws ApiError
     */
    public static tasksControllerCreateCron(
        requestBody: CreateCronDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tasks/cron',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 任务列表（分页/搜索/排序）
     * 获取任务列表，支持分页、搜索、状态筛选、类型筛选和排序功能
     * @param search 按名称模糊搜索
     * @param status 任务状态筛选
     * @param type 任务类型筛选
     * @param page 页码，默认为1
     * @param pageSize 每页记录数，默认为20
     * @param orderBy 排序字段，默认为createdAt
     * @param orderDir 排序方向，默认为desc
     * @returns any 任务列表分页数据
     * @throws ApiError
     */
    public static tasksControllerList(
        search?: any,
        status?: 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED',
        type?: 'ONCE' | 'CRON',
        page?: number,
        pageSize?: number,
        orderBy?: 'createdAt' | 'updatedAt',
        orderDir?: 'asc' | 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tasks',
            query: {
                'search': search,
                'status': status,
                'type': type,
                'page': page,
                'pageSize': pageSize,
                'orderBy': orderBy,
                'orderDir': orderDir,
            },
            errors: {
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 任务详情
     * 根据任务ID获取单个任务的详细信息
     * @param id 任务 ID
     * @returns any 任务详细信息
     * @throws ApiError
     */
    public static tasksControllerDetail(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tasks/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `未授权，访问令牌无效或已过期`,
                404: `任务不存在`,
            },
        });
    }
    /**
     * 更新任务（可改名/cron/payload/status）
     * 更新任务的名称、Cron表达式、负载数据或状态。注意：修改Cron表达式会重新创建BullMQ任务
     * @param id 任务 ID
     * @param requestBody 任务更新参数
     * @returns any 更新后的任务信息
     * @throws ApiError
     */
    public static tasksControllerUpdate(
        id: string,
        requestBody: UpdateTaskDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/tasks/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                401: `未授权，访问令牌无效或已过期`,
                404: `任务不存在`,
            },
        });
    }
    /**
     * 删除任务（会移除对应队列任务）
     * 删除指定任务，会同时移除对应的BullMQ队列任务。对于Cron任务会移除重复任务，对于一次性任务会移除具体任务
     * @param id 任务 ID
     * @returns any 删除成功响应
     * @throws ApiError
     */
    public static tasksControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/tasks/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `未授权，访问令牌无效或已过期`,
                404: `任务不存在`,
            },
        });
    }
    /**
     * 暂停整个任务队列（数据库状态标记为 PAUSED）
     * 暂停整个任务队列，所有状态为SCHEDULED的任务会被标记为PAUSED状态，队列处理会被暂停
     * @returns any 暂停成功响应
     * @throws ApiError
     */
    public static tasksControllerPause(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tasks/pause',
            errors: {
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 恢复整个任务队列（数据库状态恢复为 SCHEDULED）
     * 恢复被暂停的任务队列，所有状态为PAUSED的任务会被恢复为SCHEDULED状态，队列处理会重新启动
     * @returns any 恢复成功响应
     * @throws ApiError
     */
    public static tasksControllerResume(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tasks/resume',
            errors: {
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 立即执行某任务一次（不改变其计划）
     * 立即触发执行指定的任务一次，不改变任务原有的执行计划。对于Cron任务，会创建一个独立的立即执行任务
     * @param id 任务 ID
     * @returns any 立即执行任务的响应，包含新创建的任务ID
     * @throws ApiError
     */
    public static tasksControllerRunNow(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tasks/{id}/run',
            path: {
                'id': id,
            },
            errors: {
                401: `未授权，访问令牌无效或已过期`,
                404: `任务不存在`,
            },
        });
    }
}
