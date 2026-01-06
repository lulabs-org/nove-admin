/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VerifyCodeDto } from '../models/VerifyCodeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VerificationService {
    /**
     * 发送验证码
     * 向指定的邮箱或手机号发送验证码。支持注册、登录、重置密码等场景。发送频率限制：同一目标60秒内只能发送一次。验证码有效期为5分钟。
     * @param requestBody 发送验证码请求参数
     * @param contentType 请求内容类型
     * @returns any 验证码发送成功，请查收邮箱或短信
     * @throws ApiError
     */
    public static verificationControllerSend(
        requestBody: {
            /**
             * 邮箱或手机号
             */
            target: string;
            /**
             * 验证码类型
             */
            type: 'register' | 'login' | 'reset_password';
            /**
             * 国家代码
             */
            countryCode?: string;
        },
        contentType: string = 'application/json',
    ): CancelablePromise<{
        /**
         * 发送是否成功
         */
        success?: boolean;
        /**
         * 发送结果消息
         */
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/verification/send',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误，邮箱或手机号格式不正确`,
                429: `发送过于频繁，请稍后再试`,
                500: `服务器内部错误，验证码发送失败`,
            },
        });
    }
    /**
     * 验证验证码
     * 验证指定邮箱或手机号的验证码是否有效，用于注册、登录、重置密码等场景。
     * @param requestBody
     * @param contentType 请求内容类型
     * @returns any 验证结果返回
     * @throws ApiError
     */
    public static verificationControllerVerify(
        requestBody: VerifyCodeDto,
        contentType: string = 'application/json',
    ): CancelablePromise<{
        /**
         * 验证码是否有效
         */
        valid?: boolean;
        /**
         * 验证结果消息
         */
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/verification/verify',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误`,
                422: `验证码错误或已过期`,
            },
        });
    }
}
