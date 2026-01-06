/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SendEmailDto = {
    /**
     * 收件人邮箱地址
     */
    to: string;
    /**
     * 抄送邮箱地址列表
     */
    cc?: Array<string>;
    /**
     * 密送邮箱地址列表
     */
    bcc?: Array<string>;
    /**
     * 邮件主题
     */
    subject: string;
    /**
     * 邮件纯文本内容
     */
    text: string;
    /**
     * 邮件HTML内容
     */
    html?: string;
};

