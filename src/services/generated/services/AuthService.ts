/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { LoginDto } from '../models/LoginDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * 用户注册
     * 用户注册需要先通过邮箱或手机号验证码验证。支持的注册类型：email_code（邮箱验证码）、phone_code（手机验证码）。为了安全考虑，不再支持纯用户名密码注册。
     * @param requestBody 注册请求参数
     * @param contentType 请求内容类型
     * @returns AuthResponseDto 注册成功，返回访问令牌和用户信息
     * @throws ApiError
     */
    public static authControllerRegister(
        requestBody: RegisterDto,
        contentType: string = 'application/json',
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误或使用了不支持的注册方式`,
                409: `用户已存在`,
                422: `验证码错误或已过期`,
            },
        });
    }
    /**
     * 用户登录
     * 支持多种登录方式：用户名密码、邮箱密码、手机密码、邮箱验证码、手机验证码。根据不同的登录类型提供相应的参数。
     * @param requestBody 登录请求参数
     * @param contentType 请求内容类型
     * @param userAgent 用户代理信息
     * @returns AuthResponseDto 登录成功，返回访问令牌和用户信息
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
        contentType: string = 'application/json',
        userAgent?: string,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            headers: {
                'Content-Type': contentType,
                'User-Agent': userAgent,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `认证失败，用户名/密码错误或验证码无效`,
                404: `用户不存在`,
                429: `登录尝试过于频繁，请稍后再试`,
            },
        });
    }
    /**
     * 重置密码
     * 通过验证码重置用户密码。需要先调用发送验证码接口获取验证码，然后提供验证码和新密码完成重置。
     * @param requestBody
     * @param contentType 请求内容类型
     * @param userAgent 用户代理信息
     * @returns any 密码重置成功
     * @throws ApiError
     */
    public static authControllerResetPassword(
        requestBody: ResetPasswordDto,
        contentType: string = 'application/json',
        userAgent?: string,
    ): CancelablePromise<{
        /**
         * 重置是否成功
         */
        success?: boolean;
        /**
         * 重置结果消息
         */
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/reset-password',
            headers: {
                'Content-Type': contentType,
                'User-Agent': userAgent,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                404: `用户不存在`,
                422: `验证码错误或已过期`,
            },
        });
    }
    /**
     * 刷新访问令牌
     * 使用刷新令牌获取新的访问令牌。当访问令牌过期时，可以使用此接口获取新的访问令牌而无需重新登录。
     * @param requestBody 刷新令牌请求体
     * @param contentType 请求内容类型
     * @returns any 令牌刷新成功，返回新的访问令牌和刷新令牌（令牌轮换）
     * @throws ApiError
     */
    public static authControllerRefreshToken(
        requestBody: {
            /**
             * 用于换取新访问令牌的刷新令牌
             */
            refreshToken: string;
        },
        contentType: string = 'application/json',
    ): CancelablePromise<{
        /**
         * 新的访问令牌
         */
        accessToken?: string;
        /**
         * 新的刷新令牌（令牌轮换后生成的新令牌）
         */
        refreshToken?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh-token',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                401: `刷新令牌无效或已过期`,
            },
        });
    }
    /**
     * 退出登录
     * 用户退出登录。支持全面的令牌撤销，包括访问令牌和刷新令牌。可选择撤销单个设备或所有设备的令牌。
     * @param requestBody 登出请求参数（可选）
     * @returns any 退出登录成功
     * @throws ApiError
     */
    public static authControllerLogout(
        requestBody?: {
            /**
             * 刷新令牌（可选），用于撤销该刷新令牌
             */
            refreshToken?: string;
            /**
             * 设备ID（可选），用于撤销特定设备的所有令牌
             */
            deviceId?: string;
            /**
             * 是否撤销所有设备的令牌（可选）
             */
            revokeAllDevices?: boolean;
        },
    ): CancelablePromise<{
        /**
         * 退出是否成功
         */
        success?: boolean;
        /**
         * 退出结果消息
         */
        message?: string;
        details?: {
            /**
             * 访问令牌是否被撤销
             */
            accessTokenRevoked?: boolean;
            /**
             * 刷新令牌是否被撤销
             */
            refreshTokenRevoked?: boolean;
            /**
             * 是否撤销了所有设备的令牌
             */
            allDevicesLoggedOut?: boolean;
            /**
             * 撤销的令牌数量
             */
            revokedTokensCount?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `未授权，访问令牌无效或已过期`,
            },
        });
    }
}
