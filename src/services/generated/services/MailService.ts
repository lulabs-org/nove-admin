/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendEmailDto } from '../models/SendEmailDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MailService {
    /**
     * 发送邮件
     * 发送邮件到指定收件人，支持纯文本和HTML格式，可添加抄送和密送收件人。
     * @param requestBody 邮件发送请求参数
     * @param contentType 请求内容类型
     * @returns any 邮件发送成功，返回消息ID
     * @throws ApiError
     */
    public static mailControllerSendEmail(
        requestBody: SendEmailDto,
        contentType: string = 'application/json',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mail/send',
            headers: {
                'Content-Type': contentType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `邮件发送失败`,
                500: `服务器内部错误`,
            },
        });
    }
    /**
     * 验证SMTP连接
     * 验证邮件服务器SMTP连接状态，检查邮件服务是否可用。
     * @returns any SMTP连接失败
     * @throws ApiError
     */
    public static mailControllerVerifyConnection(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mail/verify',
            errors: {
                500: `验证连接时发生错误`,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static mailControllerSendLater(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mail/send-later',
        });
    }
}
