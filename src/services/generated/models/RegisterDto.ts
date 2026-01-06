/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterDto = {
    /**
     * 注册类型
     */
    type: RegisterDto.type;
    /**
     * 用户名
     */
    username?: string;
    /**
     * 邮箱
     */
    email?: string;
    /**
     * 国家代码，如 +86
     */
    countryCode?: string;
    /**
     * 手机号
     */
    phone?: string;
    /**
     * 密码，至少6位且包含字母和数字
     */
    password?: string;
    /**
     * 验证码，4-6位数字
     */
    code?: string;
    /**
     * 设备信息，如设备型号、操作系统等
     */
    deviceInfo?: string;
    /**
     * 设备ID，用于标识唯一设备
     */
    deviceId?: string;
};
export namespace RegisterDto {
    /**
     * 注册类型
     */
    export enum type {
        USERNAME_PASSWORD = 'username_password',
        EMAIL_PASSWORD = 'email_password',
        EMAIL_CODE = 'email_code',
        PHONE_PASSWORD = 'phone_password',
        PHONE_CODE = 'phone_code',
    }
}

