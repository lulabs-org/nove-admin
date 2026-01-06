/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { UserProfileResponseDto } from '../models/UserProfileResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * 获取当前用户信息
     * 获取当前登录用户的详细信息，包括基本信息、验证状态、用户档案等。需要提供有效的访问令牌。
     * @returns UserProfileResponseDto 获取用户信息成功，返回用户详细信息
     * @throws ApiError
     */
    public static userControllerGetProfile(): CancelablePromise<UserProfileResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/profile',
            errors: {
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
    /**
     * 更新用户资料
     * 更新当前登录用户的资料信息，包括用户名、邮箱、手机号、头像、姓名、个人简介等。需要提供有效的访问令牌。
     * @param requestBody 更新用户资料请求参数
     * @param contentType 请求内容类型
     * @returns UserProfileResponseDto 更新成功，返回更新后的用户信息
     * @throws ApiError
     */
    public static userControllerUpdateProfile(
        requestBody: UpdateProfileDto,
        contentType: string = 'application/json',
    ): CancelablePromise<UserProfileResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/user/profile',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                401: `未授权，访问令牌无效或已过期`,
                409: `用户名/邮箱/手机号已被其他用户使用`,
            },
        });
    }
}
