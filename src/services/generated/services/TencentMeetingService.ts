/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TencentMeetingService {
    /**
     * 腾讯会议Webhook URL验证
     * 用于腾讯会议webhook URL有效性验证
     * @param checkStr 验证字符串（Base64编码，URL参数）
     * @param timestamp 时间戳，与 nonce 结合使用，用于签名校验。
     * @param nonce 随机数，与timestamp 结合使用，用于签名校验。
     * @param signature 加密签名，signature 的计算结合开发者填写的 token、timestamp、nonce、消息体，签名计算方法请参见-https://cloud.tencent.com/document/product/1095/51612
     * @returns any 验证成功，返回解密后的明文
     * @throws ApiError
     */
    public static tencentWebhookControllerVerifyTencentWebhook(
        checkStr: string,
        timestamp: string,
        nonce: string,
        signature: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/tencent',
            headers: {
                'timestamp': timestamp,
                'nonce': nonce,
                'signature': signature,
            },
            query: {
                'check_str': checkStr,
            },
            errors: {
                400: `缺少必要参数`,
                403: `签名验证失败`,
            },
        });
    }
    /**
     * 腾讯会议Webhook事件接收
     * 接收腾讯会议的Webhook事件通知。支持会议创建、开始、结束、录制完成等事件。请求体中的data字段是Base64编码的加密事件数据，需要使用EncodingAESKey进行解密。
     * @param timestamp 时间戳，与 nonce 结合使用，用于签名校验。
     * @param nonce 随机数，与timestamp 结合使用，用于签名校验。
     * @param signature 加密签名，signature 的计算结合开发者填写的 token、timestamp、nonce、消息体，签名计算方法请参见-https://cloud.tencent.com/document/product/1095/51612
     * @param requestBody 腾讯会议Webhook事件请求体
     * @returns string Webhook处理成功，必须返回字符串 "successfully received callback"（不含引号）
     * @throws ApiError
     */
    public static tencentWebhookControllerHandleTencentWebhook(
        timestamp: string,
        nonce: string,
        signature: string,
        requestBody: any,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/tencent',
            headers: {
                'timestamp': timestamp,
                'nonce': nonce,
                'signature': signature,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `请求参数错误，如缺少必要的请求头或请求体格式不正确`,
                401: `签名验证失败，可能是timestamp、nonce或signature不正确`,
                500: `服务器内部错误，如解密失败或事件处理异常`,
            },
        });
    }
}
