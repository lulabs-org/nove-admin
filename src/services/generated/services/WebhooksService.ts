/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * Lark Webhook
     * 接收 Lark Webhook 事件
     * @returns any Webhook 处理成功
     * @throws ApiError
     */
    public static larkWebhookControllerHandleLarkWebhook(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/lark',
        });
    }
}
